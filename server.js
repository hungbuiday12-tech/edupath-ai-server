import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors({
    origin: "*"
}));

app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


/* =========================
   TRANG CHỦ SERVER
   ========================= */

app.get("/", (req, res) => {

    res.send("EDUPATH AI SERVER đang hoạt động!");

});


/* =========================
   HÀM CHỜ
   ========================= */

function sleep(ms) {

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });

}


/* =========================
   GỌI GEMINI + TỰ RETRY
   ========================= */

async function generateAI(question) {

    const maxAttempts = 4;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

        try {

            console.log(
                `Gemini attempt ${attempt}/${maxAttempts}`
            );


            const response = await ai.models.generateContent({

                model: "gemini-3.6-flash",

                contents: question,

                config: {

                    systemInstruction: `
Bạn là AI Trợ giảng của EDUPATH.

Bạn hỗ trợ học sinh THCS lớp 6 đến lớp 9.

Các môn học gồm:
Toán, Tiếng Anh, Vật lí, Hóa học, Sinh học và Tin học.

Hãy trả lời bằng tiếng Việt nếu học sinh hỏi bằng tiếng Việt.

Hãy giải thích đơn giản, rõ ràng và phù hợp với học sinh THCS.

Nếu học sinh hỏi bài tập:
- Phân tích đề.
- Trình bày từng bước.
- Giải thích cách làm.
- Cuối cùng đưa ra đáp án.

Không sử dụng emoji.

Không sử dụng các ký hiệu mũi tên như:
→
➜
➡
⇒

Không sử dụng ký hiệu đặc biệt để trang trí.

Khi trình bày các bước, dùng:

Bước 1:
Bước 2:
Bước 3:

Nếu câu hỏi không rõ, hãy hỏi lại.

Nếu không chắc chắn về thông tin, hãy nói rõ thay vì tự bịa.
`

                }

            });


            console.log("Gemini response received.");

            return response.text;

        }

        catch (error) {

            console.error(
                `Gemini attempt ${attempt} failed:`,
                error.message
            );


            /*
               Chỉ retry các lỗi tạm thời
               như 503 hoặc 429.
            */

            const status = error.status;

            if (
                status !== 503 &&
                status !== 429
            ) {

                throw error;

            }


            /*
               Không retry nếu đã hết số lần.
            */

            if (attempt === maxAttempts) {

                throw error;

            }


            /*
               Chờ:

               lần 1 → 2 giây
               lần 2 → 4 giây
               lần 3 → 8 giây
            */

            const waitTime =
                Math.pow(2, attempt) * 1000;

            console.log(
                `Retrying after ${waitTime}ms...`
            );

            await sleep(waitTime);

        }

    }

}


/* =========================
   API AI
   ========================= */

app.post("/api/ai", async (req, res) => {

    try {

        const question = req.body.question;


        if (
            !question ||
            question.trim() === ""
        ) {

            return res.status(400).json({

                error: "Bạn chưa nhập câu hỏi."

            });

        }


        console.log(
            "Question:",
            question
        );


        const answer =
            await generateAI(question);


        res.json({

            answer: answer

        });


    }

    catch (error) {

        console.error(
            "FINAL AI ERROR:",
            error
        );


        res.status(500).json({

            error:
                "Gemini đang quá tải hoặc tạm thời không khả dụng. Vui lòng thử lại sau."

        });

    }

});


/* =========================
   START SERVER
   ========================= */

const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `EDUPATH AI SERVER đang chạy trên port ${PORT}!`
        );

    }
);
