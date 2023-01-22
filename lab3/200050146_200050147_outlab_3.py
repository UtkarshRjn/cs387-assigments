import argparse, psycopg2, sys
from psycopg2.extras import execute_values
import csv

edges = None
toposort = None
visited = None

def main(args):
    connection = psycopg2.connect(host = args.host, port = args.port, database = args.name, user = args.user, password = args.pswd)
    cursor = connection.cursor()
    
    if(args.import_table_data):
        with open(args.path, 'r') as f:
            reader = csv.reader(f)
            header=next(reader) 
            for row in reader:
                execute_values(cursor,
                f"INSERT INTO {args.table} ({','.join(header)}) VALUES %s",
                [row]
            )
        connection.commit()

    if(args.export_table_data):
        cursor.execute("SELECT * FROM " + args.table)
        columns = [desc[0] for desc in cursor.description]

        if args.path == None:
            f = sys.stdout
        else:
            f = open(args.path, 'w')

        if args.format == 'csv':
            writer = csv.writer(f)
            writer.writerow(columns)
            writer.writerows(cursor.fetchall())
        elif args.format == 'sql':
            for row in cursor.fetchall():
                f.write("INSERT INTO " + args.table + f" ({', '.join(columns)}) values (" + ', '.join(row) + ");\n")
        else:
            print("Invalid format")
            return
        connection.commit()

    if(args.show_tables):
        cursor.execute("""
            SELECT tablename FROM pg_catalog.pg_tables
            WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
            ORDER BY tablename;
        """)
        table_names = [table[0] for table in cursor.fetchall()]
        for names in table_names:
            print(names)

    if(args.show_table_schema):

        cursor.execute("""
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name='{}'
            ORDER BY ordinal_position
        """.format(args.table))
        columns = cursor.fetchall()

        cursor.execute("""
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
                AND tc.table_name = kcu.table_name
            WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_name='{}'
            ORDER BY 1
        """.format(args.table))
        primary_keys = [key[0] for key in cursor.fetchall()]

        cursor.execute("""
            SELECT kcu.column_name,
               ccu.table_name AS foreign_table_name,
               ccu.column_name AS foreign_column_name,
               tc.constraint_name,
               rc.delete_rule
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            JOIN information_schema.referential_constraints rc
            ON rc.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name='{}'
            ORDER BY 1
        """.format(args.table))
        foreign_keys = cursor.fetchall()

        cursor.execute("""
            SELECT column_name, constraint_name
            FROM information_schema.constraint_column_usage
            WHERE constraint_name IN (
                SELECT constraint_name
                FROM information_schema.table_constraints
                WHERE constraint_type='UNIQUE'
                AND table_name='{}'
            )
            ORDER BY 1
        """.format(args.table))
        unique_constraints = cursor.fetchall()

        f = sys.stdout
        f.write("CREATE TABLE " + args.table + " (\n")

        for c in columns:
            f.write(f"{c[0]} {c[1]},\n")

        f.write("PRIMARY KEY (" + ', '.join(primary_keys) + ")")

        if len(foreign_keys) != 0:
            f.write(",\n")
        else:
            f.write("\n")

        for i,fk in enumerate(foreign_keys):
            column_name = fk[0]
            foreign_table_name = fk[1]
            foreign_column_name = fk[2]
            constraint_name = fk[3]
            delete_rule = fk[4]

            if i!=len(foreign_keys)-1:
                f.write(f"FOREIGN KEY ({column_name}) references {foreign_table_name}({foreign_column_name}) ON DELETE {delete_rule},\n")
            else:
                f.write(f"FOREIGN KEY ({column_name}) references {foreign_table_name}({foreign_column_name}) ON DELETE {delete_rule}")

        if len(unique_constraints) != 0:
            f.write(",\n")
        else:
            f.write("\n")

        for i,uc in enumerate(unique_constraints):
            if i!= len(unique_constraints)-1:
                f.write(f"UNIQUE (" + ', '.join(uc[0]) + "),\n")
            else:
                f.write(f"UNIQUE (" + ', '.join(uc[0]) + ")\n")

        f.write(");\n")


    if(args.import_sql):
        pass

    if(args.export_database_schema):
        pass
    
    if(args.testing):
        cursor.execute("DROP TABLE IF EXISTS test;")
        cursor.execute("CREATE TABLE test (id serial PRIMARY KEY, num integer, data varchar);")
        cursor.execute("INSERT INTO test (num, data) VALUES (%s, %s)", (100, "abc'def"))
        cursor.execute("INSERT INTO test (num, data) VALUES (%s, %s)", (200, "abc'def"))
        cursor.execute("INSERT INTO test (num, data) VALUES (%s, %s)", (100, "abc'def"))
        
        cursor.execute("SELECT * FROM test;")
        row = cursor.fetchone()
        while row != None:
            print(row)
            row = cursor.fetchone()
        
        cursor.execute("SELECT * FROM test where num = 100;")
        print(cursor.fetchall())

        cursor.execute("SELECT * FROM test;")
        print(cursor.fetchmany(3))

    if connection:
        cursor.close()
        connection.close()
    



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--name")
    parser.add_argument("--user")
    parser.add_argument("--pswd")
    parser.add_argument("--host")
    parser.add_argument("--port")
    parser.add_argument("--import-table-data", action='store_true', default=False)
    parser.add_argument("--export-table-data", action='store_true', default=False)
    parser.add_argument("--show-tables", action='store_true', default=False)
    parser.add_argument("--show-table-schema", action='store_true', default=False)
    parser.add_argument("--table")
    parser.add_argument("--format")
    parser.add_argument("--import-sql", action='store_true', default=False)
    parser.add_argument("--path")
    parser.add_argument("--export-database-schema", action='store_true',default=False)
    parser.add_argument("--testing", action = 'store_true',default=False)

    args = parser.parse_args()
    main(args)