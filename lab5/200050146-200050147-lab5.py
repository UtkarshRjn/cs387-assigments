import re
import sys
from pyspark.sql import SparkSession, Window
spark = SparkSession.builder.master("local[*]").appName("Lab5").getOrCreate()

from pyspark.sql.functions import row_number,sum,udf,array_contains,desc,asc,concat_ws
from pyspark.sql.types import ArrayType, StringType, StructType, StructField, DoubleType

#write for example " python3 200050145-200050146-lab5.py ./spark2.txt ./output.txt 5 3 "

in_path =str(sys.argv[1])
out_path =str(sys.argv[2])
n = int(sys.argv[3])
k = int(sys.argv[4])

int_schema = StructType([
    StructField("words", ArrayType(StringType())),
    StructField("next_word", StringType()),
    StructField("count", DoubleType())
])

#udf to clean and tokenize a line
def clean_and_tokenize(line):
    line = line.lower()
    line = re.sub(r'[^a-z0-9\s\.]', '', line)
    words = line.replace(".", " $ ").split()
    return words

lines = spark.read.text(in_path, wholetext=True).withColumn("words", udf(clean_and_tokenize, ArrayType(StringType()))("value")).select("words")

print(lines)

print(lines)

def ngram_next_tuple(words):
    return [(words[i:i+m], words[i+m]) for m in range(1, k+1) for i in range(len(words)-m)]

int_df = lines.selectExpr("explode(words) as word").rdd.map(lambda row: row.word).mapPartitions(lambda it: ngram_next_tuple(list(it))) \
.toDF(["words", "next_word"]).groupBy(["words", "next_word"]).count().withColumnRenamed("count", "occurrences").filter(~array_contains("words", "$"))

# total freq by group and giving row count to filter top n 
int_df = int_df.select("words", "next_word", "occurrences", sum("occurrences").over(Window.partitionBy("words")).alias("total"), row_number()\
.over(Window.partitionBy("words").orderBy(asc("next_word"),desc("occurrences"))).alias("row_count"))

# computing probability for each ngram nextword pair
int_df = int_df.select("words", "next_word", "occurrences", "total", udf(lambda count, total: count/total, DoubleType())("occurrences", "total")\
.alias("probability"), "row_count").orderBy(["words", "probability"], ascending=[True, False])

int_df = int_df.filter(int_df.row_count <= n) #Only top n possibilities

#Output
int_df = int_df.withColumn("prob_str", int_df["probability"].cast("string"))
df = int_df.drop("total","row_count","occurrences","probability").withColumn("output",concat_ws(' ',concat_ws(': ',concat_ws(", ", "words"),"next_word"),"prob_str" ))

# writes the DataFrame to text file
df.select("output").write.mode("overwrite").format("text").option("header", "false").save(out_path)
