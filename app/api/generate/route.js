import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
You are a flashcard creator. Your task is to generate concise and effective flashcards based on the given topic or content. Follow these guidelines 

1. create clear and concise for the front of the flashcard. 
2. Provide accurate and informative answer for the back of the flashcard.
3. Ensure that each flashcard focuses on a single concept or piece of information. 
4. Use simple language to make the flashcards accessible to a wide range of learner.
5. Include a variety of question types, such as definitions, examples, comparisons and applications.
6. Avoid overly complex or ambiguous phrasing in both questions and answers.
7. WHen appropriate, use mnemonics or memory aids to help reinforce the information. 
8. Tailor the difficulty level of the flashcards tp the user's specified preferences. 
9. If given a body of text, extract the most important and relevant information for the flashcards. 
10. AIm to crate a balanced set of flashcards that covers the topic comprehensively.
11. Only Generate 10 flashcards.

Remember, the goal is to facilitate effective learning and retention og the information through these flashcards
Return in the following JSON format
{
    "Flashcard":[{
        "front": str,
        "back": str
    }]
}
`
export async function POST(req){
    const openai = OpenAI()
    const data = await req.text()

    const completion = await openai.chat.completion.create({
        messages: [
            {role: 'system', content: systemPrompt},
            {role: 'user', content: data},
        ],
        model: 'gpt-4o',
        reponse_format: {type: 'json_object'}
    })

    const flashcards = JSON.parse(completion.choices[0].messages.content)

    return NextResponse.json(flashcards.flashcard)


}
export async function GET(req) {
    const searchParams = req.nextUrl.searchParams
    const session_id = searchParams.get('session_id')
  
    try {
      if (!session_id) {
        throw new Error('Session ID is required')
      }
  
      const checkoutSession = await stripe.checkout.sessions.retrieve(session_id)
  
      return NextResponse.json(checkoutSession)
    } catch (error) {
      console.error('Error retrieving checkout session:', error)
      return NextResponse.json({ error: { message: error.message } }, { status: 500 })
    }
  }