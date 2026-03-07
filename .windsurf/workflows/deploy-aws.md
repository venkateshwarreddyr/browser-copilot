---
description: Deploy browser-copilot backend to AWS Lambda
---

## Prerequisites

1. **AWS Account** - Sign up at https://aws.amazon.com/ (free tier available)
2. **AWS CLI** - Install: `brew install awscli`
3. **Configure AWS credentials**:
   ```bash
   aws configure
   # Enter: AWS Access Key ID, Secret Access Key, region (us-east-1)
   ```
4. **Serverless Framework** - Already in devDependencies

## Environment Setup

// turbo
1. Copy environment file and add your API keys:
```bash
cd /Users/amarendarreddy/Documents/venkateshwar/github-projects-x/browser-copilot-2-claude/backend
cp .env.example .env
```

2. Edit `.env` with your actual API keys:
```
LLM_BASE_URL=https://router.huggingface.co/v1
HF_API_KEY=your_huggingface_key_here
LLM_MODEL=grok-3
```

## Deploy

// turbo
3. Install dependencies and deploy:
```bash
cd /Users/amarendarreddy/Documents/venkateshwar/github-projects-x/browser-copilot-2-claude/backend
npm install
npm run deploy
```

## After Deployment

Serverless will output your API endpoint URL:
```
endpoints:
  POST - https://xxxxx.execute-api.us-east-1.amazonaws.com/chat
```

Use this URL in your extension's API configuration.

## Cost Estimate

| Tier | Requests | Cost |
|------|----------|------|
| **Free** | 0-1M/month | **$0** |
| Paid | Beyond 1M | ~$0.20 per 1M requests |

Lambda is pay-per-use: you only pay when the function runs.

## Remove (if needed)

```bash
npm run remove
```
