'use server'

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTestimony(answers: string[], writingStyle: string) {
    const prompt = `Generate a Christian testimony based on the following answers to questions:

${answers.map((answer, index) => `Question ${index + 1}: ${answer}`).join('\n\n')}

Please create a coherent, engaging, and personal testimony that incorporates these answers into a narrative format. Use a ${writingStyle} writing style.`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant that generates Christian testimonies based on user input." },
            { role: "user", content: prompt }
        ],
        max_tokens: 1000,
    });

    return completion.choices[0].message.content;
}