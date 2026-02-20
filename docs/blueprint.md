# **App Name**: DatasetForge AI – Universal AI Dataset Generator

## Core Features:

- Provider-Agnostic Dataset Generation: Generate datasets using either Gemini or OpenAI, configurable via environment variables. Supports automatic model selection based on the provider.
- Strict Schema Enforcement: Ensures that the generated JSON datasets strictly adhere to predefined schemas, including retry logic and robust JSON parsing for error-free output. Automatically chooses schema if in simple mode.
- Dataset Type Selection: Allows users to select from various preset dataset types (qa, classification, text_label, records, company, medical, school, medical_diagnosis) in a user-friendly dropdown menu.
- Advanced Mode for Custom Schemas: Provides an advanced mode where users can override the preset schemas with their own custom JSON schemas via a textarea.
- Automatic Download: Automatically downloads the generated dataset in either CSV or JSON format to the user's local storage, with clear status messages and disabled button during generation to prevent multiple requests.
- Health Check Endpoint: Implements a /health endpoint that returns a status of 'ok', allowing for easy monitoring of the backend's operational status.
- Demo Mode: Operates in a demo mode if the AI_API_KEY is missing, generating a small, fake dataset with clear labeling to allow users to test the application without an API key.
- Prompt Library: Allows users to save, load, and share prompts for different dataset types. This promotes collaboration and simplifies complex dataset generation tasks by enabling users to reuse proven configurations.
- Realistic Dataset Generation: Generates more realistic datasets, including common attributes for dataset types like 'company' (employee data, departments, etc.), medical (patient history, symptoms, diagnoses), school (student records, courses, grades), Q&A (questions and answers), and medical diagnosis (symptoms, test results, diagnoses).

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082), suggestive of knowledge and authority.
- Background color: Very light grey (#F2F2F2) - a desaturated tint of the primary, for clean contrast.
- Accent color: Violet (#8F00FF), to provide emphasis and excitement to the main color.
- Body and headline font: 'Inter', a sans-serif with a modern and neutral feel.
- Simple, clear icons representing each dataset type.
- Clean, straightforward layout with clear sections for input parameters and output display.
- Subtle loading animations during dataset generation.