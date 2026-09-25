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

app.get("/", (req, res) => {
    res.send("EDUPATH AI SERVER đang hoạt động!");
});

app.post("/api/ai", async (req, res) => {

    try {

        const question = req.body.question;

        if (!question || question.trim() === "") {
            return res.status(400).json({
                error: "Bạn chưa nhập câu hỏi."
            });
        }

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
Không sử dụng emoji.
Không sử dụng ký hiệu mũi tên như →, ➜, ➡, ⇒.
Không sử dụng các ký hiệu đặc biệt để trang trí.
Chỉ sử dụng văn bản, số, dấu câu và Markdown đơn giản.
Khi trình bày các bước, dùng:
Bước 1:
Bước 2:
Bước 3:

Không dùng emoji hoặc biểu tượng trước các bước.

Nếu học sinh hỏi bài tập:
- Phân tích đề.
- Trình bày từng bước.
- Giải thích cách làm.
- Cuối cùng đưa ra đáp án.

Nếu câu hỏi không rõ, hãy hỏi lại.

Nếu không chắc chắn về thông tin, hãy nói rõ thay vì tự bịa.
`
            }
        });

        res.json({
            answer: response.text
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message || "AI đang gặp lỗi."
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("EDUPATH AI SERVER đang chạy!");
});
