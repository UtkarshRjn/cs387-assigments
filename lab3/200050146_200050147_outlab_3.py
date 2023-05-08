import argparse, psycopg2, sys
from psycopg2.extras import execute_values
import csv

def topological_sort(graph,all_table):
    in_degree = {u: 0 for u in all_table}
    for u in graph:
        for v in graph[u]:
            in_degree[v] += 1
    queue = [u for u in all_table if in_degree[u] == 0]
    sorted_list = []
    while queue:
        u = queue.pop(0)
        sorted_list.append(u)
        if u not in graph: continue
        for v in graph[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
    if len(sorted_list) != len(all_table):
        print("LENGTH ERROR")
        return None
    return sorted_list

def show_table(table, cursor):
        cursor.execute("""
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name='{}'
            ORDER BY ordinal_position
        """.format(table))
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
        """.format(table))
        primary_keys = [key[0] for key in cursor.fetchall()]

        cursor.execute(f"SELECT pg_catalog.pg_get_constraintdef(r.oid, true) as condef FROM pg_catalog.pg_constraint r WHERE r.conrelid = '{table}'::regclass AND r.contype = 'f' ORDER BY 1")
        foreign_keys = cursor.fetchall()

        cursor.execute(f"SELECT pg_catalog.pg_get_constraintdef(r.oid, true) as condef FROM pg_catalog.pg_constraint r WHERE r.conrelid = '{table}'::regclass AND r.contype = 'u' ORDER BY 1")
        unique_constraints = cursor.fetchall()

        f = sys.stdout
        f.write("CREATE TABLE " + table + " (\n")

        for c in columns:
            f.write(f"{c[0]} {c[1]},\n")

        f.write("PRIMARY KEY (" + ', '.join(primary_keys) + ")")

        if len(foreign_keys) != 0:
            for i,fk in enumerate(foreign_keys):
                f.write(f",\n{fk[0]}")

        
        if len(unique_constraints) != 0:
            for i,uc in enumerate(unique_constraints):
                uc.write(f",\n{uc[0]}")

        f.write("\n);\n")

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

    if(args.show_tables):
        cursor.execute("""
            SELECT tablename FROM pg_catalog.pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        """)
        table_names = [table[0] for table in cursor.fetchall()]
        for names in table_names:
            print(names)

    if(args.show_table_schema):
        show_table(args.table, cursor)
        

    if(args.import_sql):
        with open(args.path, "r") as file:            
            sql_statements = file.read()
        cursor.execute(sql_statements)
        connection.commit()

    if(args.export_database_schema):
        cursor.execute("""
            SELECT DISTINCT ccu.table_name, tc.table_name
            FROM information_schema.table_constraints AS tc
            CROSS JOIN information_schema.constraint_column_usage AS ccu 
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.constraint_name=ccu.constraint_name
        """)
        table_order = cursor.fetchall()
        cursor.execute("""
            SELECT tablename FROM pg_catalog.pg_tables
            WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
            ORDER BY tablename;
        """)
        table_names = [table[0] for table in cursor.fetchall()]
        graph = {}
        for row in table_order:
            node1 = row[0]
            node2 = row[1] 
            if node1 not in graph:
                graph[node1] = []
            if node2 not in graph[node1]:
                graph[node1].append(node2)
        sorted=topological_sort(graph,table_names)
        for table_names in sorted:
            show_table(table_names,cursor)   

    
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
