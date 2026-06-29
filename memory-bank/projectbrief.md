# Project Brief: Job Application Assistant Chrome Extension

## Purpose
A Chrome extension that helps users apply to jobs posted on jobs.lever.co by:
1. Analyzing job descriptions and scoring how well the user's CV matches (via DeepSeek AI)
2. Auto-filling application forms using profile data and AI-generated answers for open-ended questions

## Core Requirements
- Manifest V3 Chrome Extension
- Works exclusively on jobs.lever.co domain
- Uses DeepSeek API (OpenAI-compatible) for AI operations
- Single Markdown file as CV + reference data source
- All AI calls go through background service worker
- Content scripts do NOT directly call any external APIs

## Key Features
1. **Match Scoring** - On JD pages, display a floating panel with weighted multi-parameter score (6 dimensions) comparing CV to job description
2. **Form Auto-Fill** - On apply pages, button-triggered auto-fill of all form fields with source indicators

## Target Users
- Job seekers who frequently apply on Lever.co
- Users who want AI-powered CV-job matching analysis
- Users who want to speed up form filling with intelligent answers

## Success Metrics
- Match score accurately reflects CV-job alignment
- Form fields correctly identified and filled
- AI-generated answers are relevant and professional
- Extension does not interfere with normal page functionality