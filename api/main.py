import os
from fastapi import FastAPI
from google.cloud import bigquery
from fastapi.middleware.cors import CORSMiddleware

PROJECT_NUMBER = os.environ.get('PROJECT_NUMBER', '')
PROJECT_ID = os.environ.get('PROJECT_ID', '')

app = FastAPI()

origins = [
    "http://localhost:5173",
    f"https://frontend-{PROJECT_NUMBER}.europe-west3.run.app"
]

app.add_middleware(
    CORSMiddleware,    
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

client_bq = bigquery.Client()
TEST_DATASET_ID=f"{PROJECT_ID}.my_test_dataset"

@app.get("/test-data")
def get_test_data():
    query = f"""
        SELECT * FROM `{TEST_DATASET_ID}.my_test_table`
    """

    query_job = client_bq.query(query)
    results = [dict(row) for row in query_job.result()]
    return results
