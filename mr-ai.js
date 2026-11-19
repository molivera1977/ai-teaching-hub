(function () {
  // Inject Mr. AI widget HTML into the page
  var widget = document.createElement('div');
  widget.id = 'mrAiWidget';
  widget.className = 'mr-ai-widget';
  widget.innerHTML =
    '<button class="mr-ai-toggle" id="mrAiToggleBtn">\u{1F916} Ask Mr. AI</button>' +
    '<div class="mr-ai-panel" id="mrAiPanel">' +
      '<div class="mr-ai-header">' +
        '<span class="mr-ai-avatar">\u{1F916}</span>' +
        '<div class="mr-ai-header-text">' +
          '<div class="mr-ai-name">Mr. AI</div>' +
          '<div class="mr-ai-subtitle">Your Friendly Course Assistant</div>' +
        '</div>' +
        '<button class="mr-ai-close-btn" id="mrAiCloseBtn" aria-label="Close">✕</button>' +
      '</div>' +
      '<div class="mr-ai-messages" id="mrAiMessages">' +
        '<div class="mr-ai-bubble mr-ai-assistant">Hi there! I am Mr. AI, your friendly course helper. Got a question about anything you are learning? Just ask me!</div>' +
      '</div>' +
      '<div class="mr-ai-inputbar">' +
        '<textarea id="mrAiInput" class="mr-ai-textarea" placeholder="Type your question here..." rows="2"></textarea>' +
        '<button class="mr-ai-send-btn" id="mrAiSendBtn">Send</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(widget);

  document.getElementById('mrAiToggleBtn').addEventListener('click', mrAiToggle);
  document.getElementById('mrAiCloseBtn').addEventListener('click', mrAiToggle);
  document.getElementById('mrAiSendBtn').addEventListener('click', mrAiSend);
  document.getElementById('mrAiInput').addEventListener('keydown', mrAiKeyDown);

  var mrSystemPrimer = [
    { role: 'user', content: 'Before we start, can you explain who you are and what this course covers?' },
    { role: 'assistant', content: 'Of course! I\'m Mr. AI, your assistant for this AI teaching course. I answer questions in plain, friendly language — no tech jargon.\n\nThis course covers five AI chat tools (plus Canva for designs in Lesson 4):\n• Claude — great for writing, planning, and detailed tasks\n• ChatGPT — a great all-around tool for teaching\n• Gemini — great when connected to Google Docs and Google Classroom\n• Microsoft Copilot — great for teachers using Microsoft 365\n• Perplexity — answers questions with live web search and cited sources\n\nAll five tools have free versions and work in any web browser — nothing to download. (The only exception is the optional Claude Code bonus in Lesson 6, which uses the Claude desktop app.)\n\nThe course has an optional starter lesson and six lessons:\n• Lesson 0 — Computer Basics (optional: clicking, copy and paste, finding downloads, and a word list)\n• Lesson 1 — Writing Good Prompts (a prompt has four parts: Role, Task, Details, and Audience)\n• Lesson 2 — Creating Classroom Assignments (quizzes, reading passages, rubrics, and differentiation)\n• Lesson 3 — Using Screenshots (AI can read photos of worksheets, tests, and textbook pages; Step 7 makes easier or harder versions of an assignment)\n• Lesson 4 — Making Images and Visuals with AI (it also shows Canva for Education, which is free for K-12 teachers and includes most of Canva Pro\'s features, including making pictures with Canva AI; teachers sign up at canva.com/education, and if Canva doesn\'t recognize the school email, they upload proof that Canva usually checks within 2 days. I never guess which Pro features are left out — for that I point teachers to canva.com/education)\n• Lesson 5 — Save and Print What AI Creates\n• Lesson 6 — AI Can Build You a Website\n\nFree teacher plans (checked November 2026): Claude for Teachers is free for verified U.S. K-12 teachers through July 30, 2028 — sign up at claude.ai/teachers with a school email address — personal addresses like Gmail are not accepted (it includes Claude Code). ChatGPT for Teachers is free for verified U.S. K-12 teachers through June 2028 — sign up at chatgpt.com/plans/k12-teachers. The course recommends starting with Claude. Claude cannot make pictures such as photos or drawings (it can build simple diagrams and charts), so for images (Lesson 4) use ChatGPT, Gemini, or Copilot. Copilot inside Word, Excel, and PowerPoint needs the paid Microsoft 365 Copilot add-on; without it, use Copilot at copilot.microsoft.com. Prices and plans change often — always check the tool\'s own website.\n\nSharing a web page with students (Lesson 6): Google Drive shows an HTML file as code and Teams asks students to download it, so with those two, students download the file first and then open it. A Gemini Canvas share link (g.co/gemini/share — in Canvas, choose Share & export, then Share, then Copy link) opens the working page directly — it works with a personal Google account (if the school allows using one); on a school Google account, public links are off unless the school\'s tech team turns them on, but Canvas also has a Share to Classroom button (on by default, though a school can turn it off) that attaches the page to a Classroom post or assignment. Claude\'s Share button can also make a link (choose "Anyone with the link") on plans that offer it. Putting the page online with GitHub Pages also opens the working page directly. Lesson 6 also has an optional Claude Code bonus: Claude Code is not a separate app: it is the Code section inside the Claude desktop app for Mac or Windows (download the Claude app, then left-click Code in its sidebar); it builds a whole site in a folder on your computer, and if you ask, it can also put the site online with GitHub Pages (you need a free GitHub account the first time). It needs Claude for Teachers or a paid Claude plan.\n\nChromebooks: they use the same Ctrl shortcuts as Windows (Ctrl+C, Ctrl+V, Ctrl+P). Screenshot: press Shift + Ctrl + Show windows (or the Screenshot key). I say the Show windows key is in the top row of the keyboard, and I never describe what its picture looks like. Then choose Screenshot and the partial-screenshot option in the bar at the bottom, drag a box, then left-click Capture — it is copied to the clipboard and saved in the Downloads folder. Right-click: press or tap the touchpad with two fingers, or hold Alt and click. Find files: Launcher, then Files, then Downloads. A Chromebook has no Notepad or TextEdit, so to save a web page, ask Claude for a downloadable HTML file instead. The Claude desktop app (where Claude Code lives) is not offered for Chromebooks.\n\nKey ideas I always use from the course:\n• A great prompt has four parts: Role (who you are), Task (what you want), Details (grade level, subject, format), and Audience (your students).\n• Five prompting strategies from Lesson 1: Give it a role to play, Ask for options (not just one answer), Tell it what format you want, Ask it to revise, and Paste in your own text.\n• AI reads screenshots the same way it reads text — it sees the whole image, including worksheets, math problems, and instructions.\n• For copy and paste, I always recommend right-clicking first (not keyboard shortcuts) — that\'s how the course teaches it.\n\nSafety rules I always follow and remind teachers about:\n• AI can be wrong. Whenever I suggest making something for class, I always add a short reminder to read and check it before students see it — I never promise it will be perfect on the first try.\n• Keep students private: never type a student\'s name, ID number, grades, IEP or 504 details, or behavior notes into AI. Write "a student who…" and add the name yourself later.\n• The Claude Code bonus installs the Claude desktop app: use your own computer or ask the school\'s technology person first, and say yes to pop-ups only from the official Claude app from Anthropic.\n• Share links and GitHub Pages sites are public: never put student names, ID numbers, scores, or passwords on a shared page.\n• These tools are for teachers. Students should not sign up on their own. Claude requires users to be 18 or older. I do not guess other tools\' age limits — each tool sets its own age rules, so I tell teachers to check that tool\'s terms and their school\'s AI policy, and to use the tools their school allows.\n\nWhenever you ask me something, I answer using the tools and ideas taught in this course. I keep things simple and practical for classroom teachers.' }
  ];

  var mrHistory = [];

  function mrAiToggle() {
    var p = document.getElementById('mrAiPanel');
    p.classList.toggle('open');
    if (p.classList.contains('open')) document.getElementById('mrAiInput').focus();
  }

  function mrAiKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mrAiSend(); }
  }

  async function mrAiSend() {
    var inp = document.getElementById('mrAiInput');
    var msgs = document.getElementById('mrAiMessages');
    var btn = document.getElementById('mrAiSendBtn');
    var q = (inp.value || '').trim();
    if (!q) return;
    mrAddBubble(q, 'mr-ai-user');
    inp.value = ''; btn.disabled = true;
    var t = mrAddBubble('Mr. AI is thinking...', 'mr-ai-thinking');
    try {
      var r = await fetch('https://mr-ai-proxy.molivera1977.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: mrSystemPrimer.concat(mrHistory).concat([{ role: 'user', content: q }]) })
      });
      var d = await r.json();
      t.remove();
      if (d.content && d.content[0]) {
        var a = d.content[0].text;
        mrHistory.push({ role: 'user', content: q });
        mrHistory.push({ role: 'assistant', content: a });
        if (mrHistory.length > 20) mrHistory = mrHistory.slice(-20);
        mrAddBubble(a, 'mr-ai-assistant', true);
      } else {
        mrAddBubble('Sorry, I had a little trouble with that. Please try asking again.', 'mr-ai-assistant');
      }
    } catch (e) {
      t.remove();
      mrAddBubble('Oops! It looks like I lost my connection. Please check your internet and try again.', 'mr-ai-assistant');
    }
    btn.disabled = false;
    msgs.scrollTop = msgs.scrollHeight;
  }

  // Show **bold** and *italic* from Mr. AI's replies as real bold/italic.
  // Builds text nodes and elements only (never innerHTML), so reply text can't inject HTML.
  // A *...* touching a letter or number (like 2*3 and 4*5) stays plain text.
  function mrRenderRich(el, txt) {
    txt = String(txt);
    var re = /\*\*([^*\n]+)\*\*|\*([^*\s][^*\n]*?)\*/g, last = 0, m;
    while ((m = re.exec(txt)) !== null) {
      var isBold = m[1] !== undefined;
      if (!isBold && (/\w/.test(txt.charAt(m.index - 1)) || /\w/.test(txt.charAt(m.index + m[0].length)))) continue;
      if (m.index > last) el.appendChild(document.createTextNode(txt.slice(last, m.index)));
      var node = document.createElement(isBold ? 'strong' : 'em');
      node.textContent = isBold ? m[1] : m[2];
      el.appendChild(node);
      last = m.index + m[0].length;
    }
    if (last < txt.length) el.appendChild(document.createTextNode(txt.slice(last)));
  }

  // Turn a Markdown heading line ("# Tips") into bold text and drop extra blank lines.
  function mrTidy(txt) {
    return String(txt)
      .replace(/^[ \t]*#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/gm, function (m, h) { return '**' + h.replace(/\*\*/g, '') + '**'; })
      .replace(/^([ \t]*)[*\-][ \t]+/gm, '$1• ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function mrAddBubble(txt, cls, rich) {
    var msgs = document.getElementById('mrAiMessages');
    var b = document.createElement('div');
    b.className = 'mr-ai-bubble ' + cls;
    b.style.whiteSpace = 'pre-line'; // keep the paragraph and list breaks in replies
    if (rich) { mrRenderRich(b, mrTidy(txt)); } else { b.textContent = txt; }
    msgs.appendChild(b);
    msgs.scrollTop = msgs.scrollHeight;
    return b;
  }
})();
