# StudentProject
This is a simple template project for GCP, which:
  - Has an API and Frontend hosted separately in **Docker** containers in **Cloud Run**
  - Automatically sends information about new commits to **Cloud Build**, which deploys the code

## Fork
To recreate this project, you can create a **fork** of this repository in your Github account and follow the steps outlined for GCP below.

## Initial GCP setup
After creating a new GCP project and creating a fork of this repository, there is a few steps we need to do in GCP:
  - [Create a new Artifact Repository](#creating-an-artifact-repository)
  - [Create connection to Github in Cloud Build](#connecting-to-github)
  - [Create Cloud Build triggers for the frontend and api](#creating-a-cloud-build-trigger)
  - [Create a dummy table in BigQuery matching the one in the project's API](#creating-a-bigquery-table)

When creating the GCP resources, it is possible you will need to 'activate' some of them first!

### Creating an Artifact Repository
This is where the compiled frontend and api artifacts will go, and is necessary for their deployment. 
1. Search for 'Artifact Registry'
2. Click on 'Create Repository'
3. Put 'build' as the name
4. Set region to 'europe-west3 (Frankfurt)'
5. Keep all other settings and click 'Create'
6. Make sure to click 'Copy path' once it's created and save the value in notepad for later

### Connecting to Github
This is necessary for automatic triggering of builds upon commit detection:
1. Make sure you are logged into Github in the browser
2. Go to 'Cloud Build -> Repositories -> 1st gen'
3. Click on 'Connect Repository' (You may have to scroll down a bit to see the button)
4. Select 'GitHub (Cloud Build GitHub App)' and click 'Continue'
5. Authenticate Cloud Build to access your Github account
6. Select the Github Repository with the project and click 'Connect'

### Creating a Cloud Build Trigger
We will be creating two triggers, called 'deploy-api' and 'deploy-frontend'
1. Go to 'Cloud Build -> Triggers -> Create Trigger'
2. Set the name
3. Configure the repository and branch regex (make sure Repository generation is 1st gen)
4. Set cloudbuild configuration file location to match the cloudbuild files in this repository
5. Make sure to add variable `_ARTIFACT_REGISTRY_URL` and as value set the value we copied in the Artifact Registry earlier
6. Make sure to enable 'Require approval before build executes'
7. Optionally check 'Send build logs to Github'
8. Click 'Save'

### Creating a BigQuery table
1. Go to BigQuery
2. Click on 'Create new -> Table'
3. Click 'Dataset - Create new Dataset'
4. Set the name 'my_test_dataset' and click 'Create dataset'
5. Select the newly created dataset as the dataset for this table
6. Set the table name as 'my_test_table'
7. Set the table fields under 'Schema' as follows:

| Field Name | Type    | Mode     |
|-----------|---------|----------|
| ID        | STRING  | NULLABLE |
| Name      | STRING  | NULLABLE |
| BirthDate | DATETIME| NULLABLE |
| Country   | STRING  | NULLABLE |

8. Click on 'Create table'
9. Run the following SQL (Click on the + in the control panel and paste the query there):
```
INSERT INTO `my_test_dataset.my_test_table` (ID, Name, BirthDate, Country)
VALUES
  ('a05dbe3b-5d51-42bb-bfec-900e2d6d8e25', 'Ramon Ortega',   DATETIME '1987-02-11 00:00:00', 'Mexico'),
  ('eeffc695-e5f0-4171-ac5e-c58f71bc666e', 'Jan Moldavsek', DATETIME '1974-05-13 00:00:00', 'Czechia'),
  ('9961ec13-867b-4c2b-8911-0ab519f77c71', 'John Casidy',   DATETIME '2000-01-07 00:00:00', 'USA'),
  ('3a8d6254-7e8c-47bf-8692-eb47e0c1314d', 'Ulrich Haltmann', DATETIME '1997-09-20 00:00:00', 'Germany');
```

## Deploy
- Now that all the resources have been created, go to 'Cloud Build' and execute 'deploy-frontend' and 'deploy-api'
- Then go into subtab 'History' and approve the two pending builds 
- After the triggers finish building, go to 'Cloud Run' and find the frontend resource
- There, go to 'Networking' tab and click on the link containing the project number
- If everything worked correctly, you should see a webpage appear and after a few seconds the dummy data we setup should load
