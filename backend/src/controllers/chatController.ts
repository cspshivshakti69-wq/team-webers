import { Request, Response } from 'express';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// System instructions to guide Gemini's persona and context
const SYSTEM_INSTRUCTION = `You are "Seva Helper" (ಸೇವಾ ಸಹಾಯಕಿ), the friendly bilingual chatbot assistant for the "Kannada Seva" (ಕನ್ನಡ ಸೇವಾ) school analytics website. 
Your goal is to guide students, teachers, guardians, and administrators. 
- You speak both English and Kannada.
- Always respond in the language the user queried in (if they ask in Kannada, respond in Kannada; if English, respond in English).
- Be polite, friendly, and extremely concise (limit responses to 2-3 short sentences).
- Guide users on features:
  - Check missing assignments: Students/Guardians can see them under "Missing Assignments".
  - See grades/marks: View "Progress Report" or "Summary by Class".
  - Chronic Absenteeism: Admins can view this donut chart on the Admin Summary dashboard.
  - Submit videos: Go to the "Video Section" in the top navigation, and fill the submit form.
  - Add students: Admins can manually type student details using the "+ Add Student" green button on the "Students" page.
  - Review logs: Go to the "Logs" section.`;

// In-memory simulation fallback if no API key is set
const getLocalSimulationResponse = (message: string): string => {
  const query = message.toLowerCase();

  // Kannada keyword matching
  if (query.includes('ಅಂಕ') || query.includes('ಮಾರ್ಕ್ಸ್') || query.includes('marks') && (query.includes('ನೋಡ') || query.includes('ಹೇಗೆ'))) {
    return 'ನಿಮ್ಮ ಅಂಕಗಳನ್ನು ನೋಡಲು ಸ್ಟೂಡೆಂಟ್ ಪ್ರೋಗ್ರೆಸ್ ರಿಪೋರ್ಟ್ (Progress Report) ಪುಟಕ್ಕೆ ಭೇಟಿ ನೀಡಿ. ಅಲ್ಲಿ ವಿಷಯವಾರು ಅಂಕಗಳು ಹಾಗೂ ಪಾಯಿಂಟ್ಸ್ ಸರಾಸರಿ ಕಾಣಿಸುತ್ತದೆ.';
  }
  if (query.includes('ಬಾಕಿ') || query.includes('ಕಾರ್ಯ') || (query.includes('assignment') && (query.includes('missing') || query.includes('pending')))) {
    return 'ಬಾಕಿ ಇರುವ ಕೆಲಸಗಳನ್ನು ನೋಡಲು "ಬಾಕಿ ಇರುವ ಕಾರ್ಯಗಳು" (Missing Assignments) ಪುಟಕ್ಕೆ ಭೇಟಿ ನೀಡಿ. ಅಲ್ಲಿ ಕ್ಲಾಸ್ ಹೆಸರು ಮತ್ತು ಸಬ್ಮಿಷನ್ ದಿನಾಂಕ ಇರುತ್ತದೆ.';
  }
  if (query.includes('ಹಾಜರಾತಿ') || query.includes('ಗೈರು') || query.includes('absent') || query.includes('attendance')) {
    return 'ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ "Chronic Absenteeism" ಚಾರ್ಟ್ ಸಹಾಯದಿಂದ ಗೈರುಹಾಜರಿ ಪ್ರಮಾಣವನ್ನು ವೀಕ್ಷಿಸಬಹುದು. 90% ಗಿಂತ ಕಡಿಮೆ ಇರುವವರನ್ನು ಇಲ್ಲಿ ಗುರುತಿಸಲಾಗುತ್ತದೆ.';
  }
  if (query.includes('ಅಡ್ಮಿನ್') || query.includes('ಯಾರು') || query.includes('admin') || query.includes('who')) {
    return 'ಕನ್ನಡ ಸೇವಾ ಅಡ್ಮಿನ್ ಇಡೀ ಶಾಲೆಯ ವರದಿಗಳನ್ನು ನಿರ್ವಹಿಸುತ್ತಾರೆ, ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಸೇರಿಸುತ್ತಾರೆ ಮತ್ತು ವಿಡಿಯೋಗಳನ್ನು ಅಪ್ರೂವ್ ಮಾಡುತ್ತಾರೆ.';
  }
  if (query.includes('ವಿಡಿಯೋ') || query.includes('video') || query.includes('youtube')) {
    return 'ವಿಡಿಯೋ ವಿಭಾಗದಲ್ಲಿ (Video Section) ಶಾಲೆಯ ಶೈಕ್ಷಣಿಕ ಯುಟ್ಯೂಬ್ ಲಿಂಕ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು. ಅಡ್ಮಿನ್ ಅಪ್ರೂವ್ ಮಾಡಿದ ನಂತರ ಅದು ಲೈವ್ ಆಗುತ್ತದೆ.';
  }
  if (query.includes('ಕನ್ನಡ') || query.includes('seva') || query.includes('ಕನ್ನಡ ಸೇವಾ')) {
    return 'ಕನ್ನಡ ಸೇವಾ ಶಾಲಾ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಸಮುದಾಯ ವೇದಿಕೆಯಾಗಿದೆ. ಇದು ಕನ್ನಡ ಮಾಧ್ಯಮ ಶಾಲೆಗಳಿಗೆ ಪ್ರಗತಿ ವರದಿಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ.';
  }

  // English fallback responses
  if (query.includes('missing') || query.includes('assignment')) {
    return 'To view missing work, go to the "Missing Assignments" page in your student dashboard. It lists all assignments currently flagged as missing.';
  }
  if (query.includes('grade') || query.includes('marks') || query.includes('gpa') || query.includes('points')) {
    return 'You can view your grades and cumulative averages on the "Progress Report" page. It highlights assignment completion rates and points averages.';
  }
  if (query.includes('absent') || query.includes('attendance') || query.includes('absenteeism')) {
    return 'The Admin Dashboard features a "Chronic Absenteeism" donut chart showing student risk levels. Students with attendance below 90% are flagged.';
  }
  if (query.includes('add student') || query.includes('create student') || query.includes('manual')) {
    return 'Admins can add students manually by going to the "Students" directory page and clicking the "+ Add Student" green button.';
  }

  // Default bilingual greetings
  return 'ಹಲೋ! ನಾನು ಸೇವಾ ಸಹಾಯಕಿ (Seva Helper). ಕನ್ನಡ ಸೇವಾ ಅಪ್ಲಿಕೇಶನ್ ಬಗ್ಗೆ ಯಾವುದೇ ಸಹಾಯಕ್ಕಾಗಿ ನನ್ನನ್ನು ಕೇಳಿ! / Hello! I am Seva Helper. How can I help you navigate the Kannada Seva school analytics portal today?';
};

export const handleChatMessage = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    if (!GEMINI_API_KEY) {
      // Return local simulated response
      const reply = getLocalSimulationResponse(message);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return res.json({ response: reply, isMock: true });
    }

    try {
      // Format history into Gemini API format
      // Gemini expects contents as: Array of { role: 'user' | 'model', parts: [{ text: string }] }
      const contents = [];
      
      if (history && Array.isArray(history)) {
        history.forEach((h: any) => {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
          });
        });
      }

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const requestBody = {
        contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        generationConfig: {
          maxOutputTokens: 250,
          temperature: 0.7
        }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
      }

      const responseData = await response.json();
      const botReply = responseData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI model.';

      res.json({ response: botReply, isMock: false });
    } catch (apiErr: any) {
      console.warn('Gemini API call failed, falling back to local simulation:', apiErr.message);
      const reply = getLocalSimulationResponse(message);
      res.json({ response: reply, isMock: true });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
