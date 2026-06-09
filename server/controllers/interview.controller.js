import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import { diffieHellman } from "crypto";



export const analyzeResume = async(req, res)=>{
    try {
        if(!req.file){
            return res.status(400).json({message: "Resume required"})
        }
        const filepath = req.file.path
        const fileBuffer = await fs.promises.readFile(filepath)
        const uint8Array = new Uint8Array(fileBuffer)
        
        const pdf = await pdfjsLib.getDocument({data:uint8Array}).promise;

        let resumeText = "";
        for (let pageNum=1; pageNum<=pdf.numPages;pageNum++){
            const page = await pdf.getPage(pageNum);
            const context = await page.getTextContent();

            const pageText = context.items.map(items => items.str).join(" ");
            resumeText += pageText + '\n';
        }
        resumeText = resumeText.replace(/\s+/g," ").trim();

        const messages =[
            {
                role : "system",
                content : `
                Extract structured data from resume. 
                Return strictly JSON :
                {
                "role" : "string",
                "experience" : "string",
                "projects" : ["project1" , "project2"],
                "skills" : ["skill1" , "skill2"]
                }`
            },
            {
                role : "user",
                content : resumeText
            }
        ];
        const aiResponse = await askAi(messages)

        const parsed = JSON.parse(aiResponse);

        fs.unlinkSync(filepath)

        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects : parsed.projects,
            skills: parsed.skills,
            resumeText
        });

        
    } catch (error) {
        console.error(error);
        if(req.file && fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({message: error.message});
        
    }

}

export const generateQuestion = async(req, res)=>{
    try {
        let  { role, experience, mode, resumeText , projects , skills }= req.body    
        
        role = role?.trim();
        experience = experience?.trim();
        mode = mode?.trim();

        if(!role || !experience || !mode){
            return res.status(400).json({message:"Role , experience and mode are required."})
        }

        const user = await User.findById(req.userId)

        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        if(user.credits<10){
            return res.status(400).json({message:"Not Enough credits to continue request. Minimum 10 credits are required."})
        }

        const projectText = Array.isArray(projects) && projects.length? projects.join(", "):"None";
        const skillsText = Array.isArray(skills) && skills.length? skills.join(", "): "None";

        const safeResume = resumeText?.trim() || "None";

        const userPrompt = `
        Role:${role}
        Experience:${experience}
        InterviewMode:${mode}
        Projects:${projectText}
        Skills:${skills}
        Resume:${safeResume}
        `;
        if(!userPrompt.trim()){
            return res.status(400).json({message:"Prompt content is empty"})
        }
        const messages = [
            {
                role:"system",
                content : `You are a real human interviewer conducting a professional interview .
                Speak in simple, natural English as if you are directly talking to the candidate.

                Generate exactly 10-15 interview questions.

                Strict Rules: 
                - Each Question must be a single complete sentence.
                -Do Not number them.
                - Do not add explanations.
                - Do not add extra text  before and after.
                - One question per line only.
                - Keep language simple and conversational.
                - Questions must feel practical and realistic.

                Difficulty progression:
                Question 1 to 6 -> Easy.
                Question 7 to 12 -> Medium.
                Question 13 to 15 -> Hard.

                Make questions based on the candidate role, experience ,interviewMode , projects , skills, and resume details.

                `
            },

            {
                role:"user",
                content : userPrompt
            }

        ];

        const aiResponse = await askAi(messages)
        if(!aiResponse || !aiResponse.trim()){
            return res.status(500).json({
                messages:"AI returned empty response"
            })
        }

        const questionArray = aiResponse.split("\n").map(q=> q.trim()).filter(q=>q.length>0).slice(0,15);

        if(questionArray.length ===0){
            return res.status(500).json({
                messages:"AI failed to generate Questions"
            })
        }
        user.credits-=10;
        await user.save()

        const interview = await Interview.create({
            userId: user._id,
            role,
            experience,
            mode,
            resumeText: safeResume,
            questions: questionArray.map((q, index)=>({
                question:q,
                difficulty:["Easy","Easy","Easy","Easy","Easy","Easy","Medium","Medium","Medium","Medium","Medium","Medium", "Hard","Hard","Hard",][index],
                timeLimit: [60,60,60,60,60,60,120,120,120,120,120,120,180,180,180][index],

            }))

        })
        res.json({
            interviewId: interview._id,
            creditsLeft:user.credits,
            userName : user.name,
            questions : interview.questions
        });


    } catch (error) {
        console.log("failed to create interview")
        return res.status(500).json({message: `failed to create interview ${error}`});

    }

}

export const submitAnswer = async(req, res)=>{
    try {
        const {interviewId , questionIndex , answer  , timeTaken} = req.body

        const interview = await Interview.findById(interviewId)
        const question = interview.questions[questionIndex]
        
        if (!answer){
            question.score = 0;
            question.feedback = "You didn't submit an answer";
            question.answer = "";

            await interview.save();
            return res.json({
                feedback: question.feedback
            });
        }
        if(timeTaken>question.timeLimit){
            question.score = 0;
            question.feedback = "Time limit exceeded , You didn't answer in time limit";
            question.answer = answer;

            await interview.save();

            return res.json({
                feedback : question.feedback
            });

        }

        const messages = [
            {
                role : "system",
                content : `
                You are a professional human interviewer evaluating a candidate's answer in a real interview.
                Evaluate naturally and fairly, like a real person would(don't do unnecessary sugar coating of words).\
                Score the answer in these areas (0 to 10):
                
                1. Confidence - Does the answer sound clear, confident, and well-presented?
                2. Communication - Is the language simple, clear, and easy to understand?
                3. Correctness - Is the answer accurate, relevant, and complete?

                Rules:
                - Be realistic and unbiased.
                - Do not give random high scores.
                - If the answer is weak, score low.
                - If the answer is strong and detailed, score high.
                - Consider clarity, structure and relevance.
                calculate:
                finalScore = average of confidence, communication and correctness (rounded to nearest whole number).

                Feedback Rules:
                - Write natural human feedback.
                - 10-15 words only.
                - Sound like real interview feedback.
                - Can suggest improvement if needed.
                - Do not repeat the question.
                - do not explain scoring.
                - Keep tone professional and honest.

                Return ONLY valid JSON in this format:
                {
                "Confidence" : number,
                "Communication" : number,
                "Correctness" : number,
                "final-score" : number,
                "feedback" : "Short human feedback"                
                }
                `
            },
            {
                role: "user",
                content: `
                Question: ${question.question}
                Answer: ${answer}
                `
            }
        ]
        const aiResponse = await askAi(messages)
        
        const parsed = JSON.parse(aiResponse);

        question.answer = answer;
        question.confidence = parsed["Confidence"];
        question.communication = parsed["Communication"];
        question.correctness = parsed["Correctness"];
        question.score = parsed["final-score"];
        question.feedback = parsed["feedback"];

        await interview.save();

        return res.status(200).json({feedback: parsed["feedback"]})
        
        
        
    } catch (error) {
        console.log("failed to submit answer")
        return res.status(500).json({message : `failed to submit answer ${error}`})
        
    }
}


export const finishInterview = async(req, res)=>{
    try {
        const {interviewId}  = req.body;
        const interview = await Interview.findById(interviewId);
        if(!interviewId){
            return res.status(400).json({message : `failed to find interview`})
        }
        const totalQuestions  = interview.questions.length;
        let totalScore  = 0;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness  = 0;

        interview.questions.forEach((q)=>{
            totalScore+= q.score || 0;
            totalConfidence+= q.confidence || 0;
            totalCommunication+= q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        const finalScore = totalQuestions? totalScore/totalQuestions : 0;

        const avgConfidence = totalQuestions? totalConfidence/totalQuestions : 0;
        
        const avgCommunication = totalQuestions? totalCommunication/totalQuestions : 0;

        const avgCorrectness = totalQuestions? totalCorrectness/totalQuestions : 0;

        interview.finalScore = finalScore;
        interview.status = "completed";
        await interview.save();

        return res.status(200).json({
            finalScore : Number(finalScore.toFixed(1)),
            confidence : Number(avgConfidence.toFixed(1)),
            communication : Number(avgCommunication.toFixed(1)),
            correctness : Number(avgCorrectness.toFixed(1)),
            questionWiseScore : interview.questions.map((q)=>({
                question : q.question,
                score : q.score || 0,
                feedback : q.feedback || "",
                confidence : q.confidence || 0,
                communication : q.communication || 0,
                correctness : q.correctness || 0,

            })),

        }        )

    } catch (error) {
        console.log("failed to finish interview ")
        return res.status(500).json({message : `failed to finish interview ${error}`})

        
    }

}

export const getMyInterviews = async(req, res)=>{
    try {
        const interviews = await Interview.find({userId: req.userId}).sort({ createdAt : -1}).select("role experience mode finalScore status createdAt");
        return res.status(200).json(interviews)
        
    } catch (error) {
        return res.status(500).json({message : `failed to find your interview ${error}`})
    }
}

export const getInterviewReport = async (req, res)=>{
    try {
        const interview = await Interview.findById(req.params.id)
        if(!interview){
            return res.status(404).json({message : "Interview not found"})
        }
        const totalQuestions  = interview.questions.length;

        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness  = 0;

        interview.questions.forEach((q)=>{
            totalConfidence+= q.confidence || 0;
            totalCommunication+= q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        const avgConfidence = totalQuestions? totalConfidence/totalQuestions : 0;
        
        const avgCommunication = totalQuestions? totalCommunication/totalQuestions : 0;

        const avgCorrectness = totalQuestions? totalCorrectness/totalQuestions : 0;

        return res.json({
            finalScore : interview.finalScore,
            confidence : Number(avgConfidence.toFixed(1)),
            communication : Number(avgCommunication.toFixed(1)),
            correctness : Number(avgCorrectness.toFixed(1)),
            questionWiseScore : interview.questions
        });

    } catch (error) {
        return res.status(500).json({message : `failed to find currentUser Interview Report ${error}`})
        
    }
}