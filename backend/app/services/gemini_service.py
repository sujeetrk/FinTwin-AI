import os
import json

from dotenv import load_dotenv
from google import genai
from google.genai import types


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# GEMINI CONFIGURATION
# =========================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured in the .env file."
    )


# =========================================================
# GEMINI CLIENT
# =========================================================

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# =========================================================
# MODEL
# =========================================================

GEMINI_MODEL = "gemini-3.6-flash"


# =========================================================
# SYSTEM INSTRUCTION
# =========================================================

SYSTEM_INSTRUCTION = """
You are FinTwin AI, an intelligent personal finance assistant.

You are NOT a generic chatbot.

You are a financial digital twin that must analyze the user's
ACTUAL financial data provided in the FINANCIAL CONTEXT.

Your response must be personalized to the user's financial
situation.

=============================================================
CORE RULES
=============================================================

1. ALWAYS use the financial context when answering.

2. NEVER invent:
   - income
   - expenses
   - transactions
   - budgets
   - goals
   - savings
   - balances
   - dates
   - categories
   - financial statistics

3. If the financial context contains relevant numbers,
   use those numbers explicitly in your answer.

4. If the question is about the user's finances, do NOT give
   a generic financial answer when relevant user data exists.

5. Explain WHY you are making a recommendation using the
   user's actual financial data.

6. Use Indian Rupees (₹) for monetary values.

7. When percentages, savings rates, remaining amounts,
   or other calculations are relevant, calculate them
   carefully.

8. If a value is already provided in the financial context,
   prefer that value rather than calculating a conflicting
   value.

9. Never claim information exists if it is missing.

10. If required information is missing, explicitly say:
    "I don't have enough information in your financial data
    to determine that."

11. Consider the user's complete financial picture:
    - income
    - expenses
    - balance
    - savings
    - budgets
    - goals
    - transactions
    - spending patterns
    - financial health
    - forecasts
    - risks
    - recommendations

12. Connect related information whenever useful.

13. Give practical and actionable recommendations.

14. Do not guarantee investment returns.

15. Do not claim to be a certified financial advisor.

16. Do not make financial decisions on behalf of the user.

17. For investment-related questions, provide general
    educational information and clearly state when the
    available financial data is insufficient for a
    personalized investment decision.

=============================================================
RESPONSE STYLE
=============================================================

Make the response feel like a personal financial assistant
who knows the user's financial situation.

Do NOT start with generic statements such as:

"Saving money is important."

Instead, directly analyze the user's situation.

For example:

"Based on your current financial data, your monthly expenses
are ₹X against an income of ₹Y, giving you a savings rate of Z%."

Use sections when appropriate:

Financial Snapshot
What I Notice
Why It Matters
Recommendations
Next Steps

Use numbered recommendations when there are multiple actions.

Keep responses concise enough to be readable, but provide
enough detail to demonstrate genuine analysis.

=============================================================
IMPORTANT
=============================================================

The FINANCIAL CONTEXT is the source of truth.

The user's question tells you WHAT they want to know.

The financial context tells you WHICH facts you should use
to answer it.

Never replace the user's actual financial data with generic
assumptions.
"""


# =========================================================
# FORMAT FINANCIAL CONTEXT
# =========================================================

def format_financial_context(financial_context) -> str:
    """
    Convert the financial context into a clean representation
    that Gemini can reliably understand.

    The context may be a dictionary, list, string, or another
    serializable object.
    """

    if financial_context is None:
        return "No financial information is available."

    if isinstance(financial_context, str):
        return financial_context

    try:
        return json.dumps(
            financial_context,
            indent=2,
            ensure_ascii=False,
            default=str
        )
    except Exception:
        return str(financial_context)


# =========================================================
# GENERATE AI RESPONSE
# =========================================================

def generate_financial_response(
    user_question: str,
    financial_context
) -> str:

    # -----------------------------------------------------
    # VALIDATE QUESTION
    # -----------------------------------------------------

    user_question = user_question.strip()

    if not user_question:
        return "Please enter a financial question."


    # -----------------------------------------------------
    # FORMAT CONTEXT
    # -----------------------------------------------------

    formatted_context = format_financial_context(
        financial_context
    )


    # -----------------------------------------------------
    # BUILD PROMPT
    # -----------------------------------------------------

    prompt = f"""
=============================================================
FINANCIAL CONTEXT
=============================================================

The following information belongs to the CURRENT USER.

Treat it as the source of truth.

{formatted_context}


=============================================================
USER QUESTION
=============================================================

{user_question}


=============================================================
INSTRUCTIONS FOR THIS RESPONSE
=============================================================

1. Identify which parts of the financial context are relevant
   to the user's question.

2. Use the user's actual numbers whenever available.

3. Explain the situation based on those numbers.

4. If calculations are useful, calculate them carefully.

5. Provide practical recommendations based on the user's
   actual financial situation.

6. Do not invent missing information.

7. Do not give generic advice when the user's data allows
   for personalized advice.

8. If the question is unrelated to the available financial
   information, explain that clearly.

9. Make the response useful enough that the user can take
   action from it.

10. Do not mention these instructions in your response.

=============================================================
ANSWER
=============================================================
"""


    # -----------------------------------------------------
    # CALL GEMINI
    # -----------------------------------------------------

    try:

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                max_output_tokens=2000
            )
        )

    except Exception as error:

        print(
            "Gemini generation error:",
            repr(error)
        )

        return (
            "I couldn't generate your financial analysis "
            "right now. Please try again."
        )


    # -----------------------------------------------------
    # EXTRACT RESPONSE
    # -----------------------------------------------------

    if not response or not response.text:

        return (
            "I was unable to generate a financial response "
            "at the moment. Please try again."
        )


    return response.text.strip()