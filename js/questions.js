    // ============================================================================
    // COMPLETE 40 QUESTIONS DATASET (RECONSTRUCTED FROM THE ITS REVIEWER PDF)
    // ============================================================================
    const QUESTIONS = [
      // Q1
      {
        id: 1,
        type: 'dropdown-code',
        category: 'Multimedia Presentation using HTML',
        prompt: `You need to code a web page that will display a promotional video. The video is available in both mp4 and webm formats. The mp4 format is given first priority. The media files are stored in the video subfolder. The video should display in 320x240 with pause, volume, and closed captioning controls.\nComplete the markup by selecting the correct option from each drop-down list.`,
        codeTemplate: `&lt;{{dd0}}&gt;
  &lt;source {{dd1}} type="video/mp4"&gt;
  &lt;source {{dd2}} type="video/webm"&gt;
  &lt;track label="English" kind="subtitles" srclang="en" {{dd3}} default&gt;
  Your browser does not support the video tag.
&lt;/video&gt;`,
        dropdowns: [
          {
            options: [
              'video width="320" height="240" controls',
              'video size="320x240" controls',
              'video width="320" height="240" autoplay',
              'media width="320" height="240" controls'
            ],
            answer: 'video width="320" height="240" controls'
          },
          {
            options: [
              'src="video/AWpromo.mp4"',
              'src="video/AWpromo.webm"',
              'href="video/AWpromo.mp4"',
              'src="AWpromo.mp4"'
            ],
            answer: 'src="video/AWpromo.mp4"'
          },
          {
            options: [
              'src="video/AWpromo.webm"',
              'src="video/AWpromo.mp4"',
              'href="video/AWpromo.webm"',
              'src="AWpromo.webm"'
            ],
            answer: 'src="video/AWpromo.webm"'
          },
          {
            options: [
              'src="video/AWpromo-en.vtt"',
              'href="video/AWpromo-en.vtt"',
              'src="AWpromo-en.vtt"',
              'track="video/AWpromo-en.vtt"'
            ],
            answer: 'src="video/AWpromo-en.vtt"'
          }
        ],
        explanation: `Use <video width="320" height="240" controls> for dimensions and playback controls. Place the mp4 <source> first so it gets first priority, referencing the "video/" subfolder, and use src="video/AWpromo-en.vtt" on the <track> element for closed captions.`
      },

      // Q2
      {
        id: 2,
        type: 'dropdown-qa',
        category: 'HTML Fundamentals',
        prompt: `The image below shows the search results for The Food Club.\nEvaluate the image and answer the questions by selecting the correct option from each drop-down list.`,
        exhibitHtml: `
          <div class="p-4 bg-white border-2 border-slate-300 rounded max-w-2xl shadow-xs font-sans">
            <div class="text-xs text-emerald-800">www.thefoodclub.org</div>
            <div class="text-lg font-semibold text-blue-700 underline mb-1">The Food Club</div>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Each meal from The Food Club is perfectly sized and portioned for your family to enjoy at 1 sitting. Our fully-prepared meals are delivered fresh, and ready to eat in 10-15 minutes. Designed and prepared by highly trained and award-winning chefs, The Food Club meals use high-quality and fresh ingredients, delivered to your door.
            </p>
          </div>
        `,
        items: [
          {
            question: 'Which meta attribute causes a search engine to produce the results shown when the value is set to keyword?',
            options: ['name', 'content', 'charset', 'http-equiv'],
            answer: ['name']
          },
          {
            question: 'Which meta value matches the paragraph of text yielded in the search result?',
            options: ['keywords', 'description', 'title', 'summary'],
            answer: ['description']
          },
          {
            question: 'Which meta attribute is paired with name to produce the text shown in the search result?',
            options: ['content', 'value', 'text', 'description'],
            answer: ['content']
          }
        ],
        explanation: `1) "name" specifies the metadata type (e.g., name="keywords" or name="description").\n2) "description" (<meta name="description" content="...">) provides the summary paragraph snippet displayed beneath the page title in search engine results. ( Exam Audit Note: The raw reviewer PDF screenshot showed "keywords" selected by the previous test-taker, which is incorrect—search engines use "description" for the summary paragraph.)\n3) "content" holds the actual text string paired with the name attribute.`
      },

      // Q3
      {
        id: 3,
        type: 'multi-select',
        category: 'CSS Fundamentals',
        chooseCount: 2,
        prompt: `You need to create a page that displays the text Hello! according to the following requirements:\n• Red text\n• 45-pixel font size\n• 90% transparency\n\nWhat are two possible HTML code segments that will achieve this goal? (Choose 2)\nNote: Each correct answer presents a complete solution.`,
        options: [
          {
            id: 'A',
            code: `<html>\n<style>\np { color: red; opacity: 0.1; font-size: 45px; }\n</style>\n<body>\n<p style="color: blue">Hello!</p>\n</body>\n</html>`
          },
          {
            id: 'B',
            code: `<html>\n<style>\n{color: red opacity: 0.1 font-size: 45px}\n</style>\n<body>\n<p>Hello!</p>\n</body>\n</html>`
          },
          {
            id: 'C',
            code: `<html>\n<style>\np {color: red; opacity: 0.1; font-size: 45px; }\n</style>\n<body>\n<p>Hello!</p>\n</body>\n</html>`
          },
          {
            id: 'D',
            code: `<html>\n<body>\n<p style="color: #FF0000; opacity: 0.1; font-size: 45px;">Hello!</p>\n</body>\n</html>`
          }
        ],
        answer: ['C', 'D'],
        explanation: `90% transparency means 10% opacity (opacity: 0.1). Option C uses a valid internal p selector with red, opacity: 0.1, and font-size: 45px. Option D uses valid inline CSS with hex red (#FF0000), opacity: 0.1, and font-size: 45px.`
      },

      // Q4
      {
        id: 4,
        type: 'drag-match',
        category: 'Webpage Styling using CSS',
        prompt: `Move the appropriate CSS position property values from the list on the left to the descriptions on the right. You may use each value once, more than once, or not at all.`,
        bankTitle: 'Position Property Values',
        bank: ['fixed', 'static', 'inherit', 'relative', 'absolute'],
        targetsTitle: 'Descriptions',
        targets: [
          { label: 'Element appears in the order in which it is placed in the document flow.', answer: 'static' },
          { label: 'Element is positioned relative to the first positioned ancestor', answer: 'absolute' },
          { label: 'Element is positioned relative to the browser window', answer: 'fixed' },
          { label: "Element is positioned based on its parent element's position", answer: 'inherit' }
        ],
        explanation: `• static: Default document flow order.\n• absolute: Positioned relative to the nearest positioned ancestor.\n• fixed: Positioned relative to the browser viewport/window.\n• inherit: Inherits the position value of its parent element.`
      },

      // Q5
      {
        id: 5,
        type: 'dropdown-qa',
        category: 'Multimedia Presentation using HTML',
        prompt: `You write the following HTML markup to display an image:\n<code class="code-font bg-slate-100 px-2 py-0.5 rounded border border-slate-300">&lt;img src="flowers.png" alt="Flowers" title="Carnations"&gt;</code>\n\nAnswer the questions by selecting the correct option from each drop-down list.`,
        items: [
          {
            question: 'What text will be displayed as the image loads?',
            options: ['Flowers', 'Carnations', 'flowers.png', 'No text'],
            answer: ['Flowers']
          },
          {
            question: 'What text will be displayed as a tool tip?',
            options: ['Carnations', 'Flowers', 'flowers.png', 'No text'],
            answer: ['Carnations']
          },
          {
            question: 'Where must the image file be located?',
            options: [
              'In the same folder as the HTML page',
              'In the images subfolder',
              'In the root directory of the server',
              'On an external URL'
            ],
            answer: ['In the same folder as the HTML page']
          }
        ],
        explanation: `The alt attribute ("Flowers") displays alternative text while loading or if the image fails. The title attribute ("Carnations") displays as a hover tooltip. Since src="flowers.png" has no folder prefix, it must be in the same folder as the HTML page.`
      },

      // Q6
      {
        id: 6,
        type: 'dropdown-code',
        category: 'Multimedia Presentation using HTML',
        prompt: `You need to display an image of an HTML5 logo on one of your web pages. If the page renders slowly, the text "HTML5 Icon" should display as the image loads.\nComplete the markup by selecting the correct option from each drop-down list.`,
        codeTemplate: `&lt;img {{dd0}}="html5.gif" {{dd1}}="HTML5 Icon" {{dd2}}="width:128px;"/&gt;`,
        dropdowns: [
          { options: ['src', 'href', 'url', 'link'], answer: 'src' },
          { options: ['alt', 'title', 'name', 'text'], answer: 'alt' },
          { options: ['style', 'size', 'css', 'width'], answer: 'style' }
        ],
        explanation: `<img src="html5.gif" alt="HTML5 Icon" style="width:128px;"/> uses src for the image file, alt for fallback/loading text, and style for inline CSS width.`
      },

      // Q7
      {
        id: 7,
        type: 'drag-sequence',
        category: 'Document Structure using HTML',
        prompt: `You are creating a home page for CompanyPro. You need to determine which HTML elements will create a simple web page.\nWhich six HTML segments should you use in sequence? Move the six HTML segments to the answer area and place them in the correct order.`,
        bankTitle: 'HTML Segments',
        bank: [
          '<!DOCTYPE html>',
          '<html>',
          '<head>\n<title>CompanyPro</title>',
          '</head>',
          '<body>\n<h1>Welcome to CompanyPro</h1>\n<p>Our new store on 1 Main Street is now open.</p>\n</body>',
          '</html>',
          '<title>CompanyPro</title>',
          '<h1>Welcome to CompanyPro</h1>'
        ],
        sequenceAnswers: [
          '<!DOCTYPE html>',
          '<html>',
          '<head>\n<title>CompanyPro</title>',
          '</head>',
          '<body>\n<h1>Welcome to CompanyPro</h1>\n<p>Our new store on 1 Main Street is now open.</p>\n</body>',
          '</html>'
        ],
        explanation: `A valid HTML5 document starts with <!DOCTYPE html>, followed by <html>, <head> containing <title>CompanyPro</title>, closing </head>, the <body> section, and closing </html>.`
      },

      // Q8
      {
        id: 8,
        type: 'mcq',
        category: 'CSS Fundamentals',
        prompt: `What is the correct syntax to change the font color of a visited link to magenta?`,
        options: [
          { id: 'A', code: `a:visited {\n  color = magenta;\n}` },
          { id: 'B', code: `a#link {\n  color = magenta;\n}` },
          { id: 'C', code: `a.link {\n  color: magenta;\n}` },
          { id: 'D', code: `a:visited {\n  color: magenta;\n}` }
        ],
        answer: 'D',
        explanation: `The :visited pseudo-class targets visited links, and CSS properties use a colon (color: magenta;), not an equals sign.`
      },

      // Q9
      {
        id: 9,
        type: 'dropdown-code',
        category: 'Webpage Styling using CSS',
        prompt: `You need to create a style for a paragraph so the text is double-spaced with 5px between characters.\nComplete the markup by selecting the correct option from each drop-down list.`,
        codeTemplate: `&lt;style&gt;
p {
  {{dd0}}
  {{dd1}}
}
&lt;/style&gt;`,
        dropdowns: [
          { options: ['line-height: 2em;', 'line-spacing: 2em;', 'text-spacing: 2em;', 'word-spacing: 2em;'], answer: 'line-height: 2em;' },
          { options: ['letter-spacing: 5px;', 'char-spacing: 5px;', 'word-spacing: 5px;', 'font-spacing: 5px;'], answer: 'letter-spacing: 5px;' }
        ],
        explanation: `line-height: 2em sets double line spacing, and letter-spacing: 5px sets a 5-pixel space between characters.`
      },

      // Q10
      {
        id: 10,
        type: 'mcq',
        category: 'Webpage Styling using CSS',
        prompt: `What is the default value of the CSS position property?`,
        options: [
          { id: 'A', text: 'absolute' },
          { id: 'B', text: 'static' },
          { id: 'C', text: 'fixed' },
          { id: 'D', text: 'relative' }
        ],
        answer: 'B',
        explanation: `Every HTML element has position: static by default, placing it in the normal document flow.`
      },

      // Q11
      {
        id: 11,
        type: 'drag-code',
        category: 'Multimedia Presentation using HTML',
        prompt: `You are creating a web page that displays a How-To video. When accessing the video, the user must be able to play, pause, and seek. The file name of the video is HowTo.mp4, and it exists in the same folder as the web page.\nIf the user's browser does not support HTML5, the page must display this message: Your browser does not support playing this video.\nHow should you complete the markup? To answer, move the appropriate markup segments from the list on the left to the correct positions on the right.`,
        bankTitle: 'Markup Segments',
        bank: [
          'source',
          'source controls',
          '<source src="HowTo.mp4" type="video/mp4">',
          'video',
          'video controls',
          '<video src="HowTo.mp4" type="video/mp4">',
          'Your browser does not support playing this video.'
        ],
        codeTemplate: `&lt;{{slot0}}&gt;
  {{slot1}}
  {{slot2}}
&lt;/{{slot3}}&gt;`,
        slotAnswers: [
          'video controls',
          '<source src="HowTo.mp4" type="video/mp4">',
          'Your browser does not support playing this video.',
          'video'
        ],
        explanation: `Open with <video controls>, include <source src="HowTo.mp4" type="video/mp4">, place the fallback text inside the element, and close with </video>.`
      },

      // Q12
      {
        id: 12,
        type: 'drag-code',
        category: 'CSS Fundamentals',
        prompt: `You want to complete the pseudo class for link elements so that the links appear red when the page loads, green when the link is clicked, orange when the cursor moves over the link, and blue if the link was clicked previously.\nHow should you complete the markup? To answer, move the appropriate CSS selectors to the correct positions on the right.`,
        bankTitle: 'CSS Selectors',
        bank: ['a:active', 'a:visited', 'a:link', 'a:hover'],
        codeTemplate: `{{slot0}} {color: red;}

{{slot1}} {color: blue;}

{{slot2}} {color: orange;}

{{slot3}} {color: green;}`,
        slotAnswers: ['a:link', 'a:visited', 'a:hover', 'a:active'],
        explanation: `LVHA order: a:link (unvisited/initial load = red), a:visited (clicked previously = blue), a:hover (cursor over = orange), a:active (being clicked = green).`
      },

      // Q13
      {
        id: 13,
        type: 'mcq',
        category: 'CSS Fundamentals',
        prompt: `You are building a website and want to have three main links called Home, Product Info, and Contact Us. You will create a hierarchy of page elements and revise the stylesheets.\nYou want to apply a style to all elements in a document.\nWhich type selector should you use?`,
        options: [
          { id: 'A', text: ':' },
          { id: 'B', text: '>' },
          { id: 'C', text: '+' },
          { id: 'D', text: '*' }
        ],
        answer: 'D',
        explanation: `The universal selector (*) matches all elements in an HTML document.`
      },

      // Q14
      {
        id: 14,
        type: 'drag-match',
        category: 'Document Structure using HTML',
        prompt: `You are creating a home page for CompanyPro. The page will use JavaScript. If a browser does not support JavaScript, the following message must be displayed:\nYour browser does not support JavaScript!\nMove the appropriate head elements from the list on the left to the content or attribute-value pairs on the right.`,
        bankTitle: 'Head Elements',
        bank: ['<script>', '<meta>', '<title>', '<noscript>', '<link>', '<base>'],
        targetsTitle: 'Answer Area',
        targets: [
          { label: 'href="style.css"', answer: '<link>' },
          { label: 'src="_js/form.js"', answer: '<script>' },
          { label: 'CompanyPro', answer: '<title>' },
          { label: 'Your browser does not support JavaScript!', answer: '<noscript>' }
        ],
        explanation: `<link> uses href="style.css", <script> uses src="_js/form.js", <title> holds the page title "CompanyPro", and <noscript> displays fallback text when JavaScript is disabled or unsupported.`
      },

      // Q15
      {
        id: 15,
        type: 'dropdown-code',
        category: 'Accessibility, Readability, and Testing',
        prompt: `The image represents a web page displayed on the screen of a mobile phone.\nYou need to add metadata code to ensure the image matches proportionately to the display of the phone.\nComplete the markup by selecting the correct option from each drop-down list.`,
        exhibitHtml: `
          <div class="mx-auto w-56 bg-slate-900 rounded-2xl p-2.5 shadow-md border-2 border-slate-700">
            <div class="w-12 h-1 bg-slate-600 rounded mx-auto mb-2"></div>
            <div class="bg-white p-2.5 rounded text-[10px] leading-snug text-slate-800 font-serif">
              <div class="font-bold text-center text-xs mb-1">Isorropia</div>
              <p class="mb-1.5">Aenean mauris odio, blandit id metus quis, interdum elementum nibh. Nullam id est purus. Suspendisse libero nisi, efficitur vitae lorem vitae.</p>
              <p>Etiam dui nisi, faucibus at tincidunt quis, dictum in massa. Vestibulum egestas tincidunt varius.</p>
            </div>
          </div>
        `,
        codeTemplate: `&lt;meta {{dd0}}"{{dd1}}" content="width=device-width, initial-scale=1.0"&gt;`,
        dropdowns: [
          { options: ['name=', 'http-equiv=', 'charset=', 'property='], answer: 'name=' },
          { options: ['viewport', 'screen', 'mobile', 'device-width'], answer: 'viewport' }
        ],
        explanation: `<meta name="viewport" content="width=device-width, initial-scale=1.0"> instructs mobile browsers to match the screen's width at a 1.0 scale.`
      },

      // Q16
      {
        id: 16,
        type: 'mcq',
        category: 'Accessibility, Readability, and Testing',
        prompt: `The HTML validator has identified a problem in the segment of code shown below.\n<pre class="code-font text-xs bg-slate-100 p-3 rounded border border-slate-300 mt-2 overflow-x-auto">&lt;!DOCTYPE html &gt;
&lt;body&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;meta charset="utf-8" /&gt;
  &lt;title&gt;My Healthy Eats Delivery&lt;/title&gt;
  &lt;link href="css/eats.css" rel="stylesheet" /&gt;
&lt;/head&gt;
&lt;nav id="menu"&gt;
  &lt;ul id="submenu" &gt;
    &lt;li&gt;&lt;a href="home.html"&gt;About Us&lt;/a&gt;&lt;/li&gt;
    &lt;li&gt;&lt;a href="mission.html"&gt;Mission&lt;/a&gt;&lt;/li&gt;
    &lt;li&gt;&lt;a href="history.html"&gt;History&lt;/a&gt;&lt;/li&gt;
    &lt;li&gt;&lt;a href="executive.html"&gt;Executive Teams&lt;/a&gt;&lt;/li&gt;
    &lt;li&gt;&lt;a href="contact.html"&gt;Contact Us&lt;/a&gt;&lt;/li&gt;
  &lt;/ul&gt;
&lt;/nav&gt;
&lt;section&gt;&lt;/section&gt;
&lt;/body&gt;
&lt;/html&gt;</pre>\nWhat is the problem with the HTML code segment?`,
        options: [
          { id: 'A', text: 'The nav element cannot contain the ul and li elements.' },
          { id: 'B', text: 'The body element is in the wrong location.' },
          { id: 'C', text: 'The nav element should be in the <head> section.' },
          { id: 'D', text: 'The head element is in the wrong location.' }
        ],
        answer: 'B',
        explanation: `The opening <body> tag is placed before <html> and <head>. The <body> tag must be opened after the closing </head> tag.`
      },

      // Q17
      {
        id: 17,
        type: 'mcq',
        category: 'CSS Fundamentals',
        prompt: `You are designing a website for Sunset Web.\nYou write the following markup. Line numbers are included for reference only.\n<pre class="code-font text-xs bg-slate-100 p-3 rounded border border-slate-300 mt-2">01 &lt;!DOCTYPE html&gt;
02 &lt;html&gt;
03 &lt;head&gt;
04   &lt;title&gt;Sunset Web&lt;/title&gt;
05 &lt;/head&gt;
06 &lt;body&gt;
07   &lt;p&gt;Welcome to Sunset Web.&lt;/p&gt;
08 &lt;/body&gt;
09 &lt;/html&gt;</pre>\nWhich style will be used to render the code?`,
        options: [
          { id: 'A', text: 'An inline style will be used.' },
          { id: 'B', text: 'An internal style will be used.' },
          { id: 'C', text: 'An external style will be used.' },
          { id: 'D', text: 'The browser default style will be used.' }
        ],
        answer: 'D',
        explanation: `Since no external stylesheet (<link>), internal stylesheet (<style>), or inline style attribute is present, the browser default style (user-agent stylesheet) is used.`
      },

      // Q18
      {
        id: 18,
        type: 'mcq',
        category: 'CSS Fundamentals',
        prompt: `You are building a website and want to have three links called Home, Product Info, and Contact Us. You have assigned all of these elements to a class called main.\nYou need to create a selector that applies to all three links.\nWhich selector should you use?`,
        options: [
          { id: 'A', code: 'a[name="main"]' },
          { id: 'B', code: '#main' },
          { id: 'C', code: 'a#main' },
          { id: 'D', code: '.main' }
        ],
        answer: 'D',
        explanation: `In CSS, class selectors begin with a period (.main), whereas ID selectors begin with a hash (#main).`
      },

      // Q19
      {
        id: 19,
        type: 'mcq',
        category: 'HTML Fundamentals',
        prompt: `Which attribute prefills a default value for an input element in HTML5?`,
        options: [
          { id: 'A', text: 'autocomplete' },
          { id: 'B', text: 'name' },
          { id: 'C', text: 'required' },
          { id: 'D', text: 'placeholder' }
        ],
        answer: 'D',
        explanation: `Intended Exam Key: D (placeholder).\n⚠️ Technical Exam Note: In strict HTML specifications, the "value" attribute sets an actual prefilled default input value, while "placeholder" displays temporary hint text inside an empty input field. However, because "value" is not among the four choices on this official ITS exam item (autocomplete, name, required, placeholder), "placeholder" is the intended correct selection.`
      },

      // Q20
      {
        id: 20,
        type: 'dropdown-qa',
        category: 'CSS Fundamentals',
        prompt: `You define the following styles in a style block:\n<pre class="code-font text-xs bg-slate-100 p-3 rounded border border-slate-300 mt-1">&lt;style&gt;
#style1 {
  color: red;
  font-size: 30px;
}
#style2 {
  color: blue;
  font-size: 40px;
}
#style3 {
  color: green;
  font-size: 20px;
}
&lt;/style&gt;</pre>\nYou write the following HTML. Line numbers are included for reference only:\n<pre class="code-font text-xs bg-slate-100 p-3 rounded border border-slate-300 mt-1">01 &lt;body style="color:purple; font-size: 10px;"&gt;
02   &lt;p id="style1"&gt;Fasten your seat belt&lt;/p&gt;
03   &lt;p&gt;Look both ways before pulling out.&lt;/p&gt;
04   &lt;p id="style3" style="color:red;"&gt;Watch your speed.&lt;/p&gt;
05   &lt;p style="color:green; font-size: 20px;"&gt;Be ready to stop.&lt;/p&gt;
06   &lt;p style="color:red;"&gt;Study the rules of the road.&lt;/p&gt;
07   &lt;p style="font-size: 30px;"&gt;You'll be driving in no time.&lt;/p&gt;
08 &lt;/body&gt;</pre>\nAnswer the questions by selecting the correct option from each drop-down list.`,
        items: [
          {
            question: 'Line 03 displays text in which color?',
            options: ['purple', 'red', 'blue', 'green'],
            answer: ['purple']
          },
          {
            question: 'Line 04 displays text in which font size?',
            options: ['20 pixels', '10 pixels', '30 pixels', '40 pixels'],
            answer: ['20 pixels']
          },
          {
            question: 'Line 06 displays text in which color?',
            options: ['red', 'purple', 'green', 'blue'],
            answer: ['red']
          }
        ],
        explanation: `• Line 03 has no ID or inline style, so it inherits color: purple from <body>.\n• Line 04 has id="style3", which sets font-size: 20px.\n• Line 06 has an inline style="color:red;", which overrides the body's purple color.`
      },

      // Q21
      {
        id: 21,
        type: 'true-false',
        category: 'HTML Fundamentals',
        prompt: `For each statement, select True or False.`,
        statements: [
          { text: 'A relative link requires that you use a protocol and server path.', answer: 'False' },
          { text: 'You can use a relative link to reference image files on a different server.', answer: 'False' },
          { text: 'You can link to a document in a subdirectory of the current webpage by specifying only the subdirectory name and the filename.', answer: 'True' },
          { text: 'The following is an example of how you format an absolute link: https://www.companypro.com/products.html', answer: 'True' }
        ],
        explanation: `Relative links do not include a protocol/domain and only work within the same server/site. Linking to a subdirectory only requires "subdir/filename.html". Full URLs starting with https:// are absolute links.`
      },

      // Q22
      {
        id: 22,
        type: 'dropdown-code',
        category: 'Document Structure using HTML',
        prompt: `You are designing a web page that is divided into several sections. Each section has a heading and a one-line quote.\nThe following example shows the top section rendered by using the browser default styles:\n<div class="p-3 my-2 bg-white border border-slate-300 rounded font-serif"><div class="text-xl font-bold mb-1">Quote from Yesterday</div><div class="text-sm">Tomorrow is not promised</div></div>\nComplete the markup by selecting the correct option from each drop-down list.`,
        codeTemplate: `{{dd0}}
  {{dd1}}
    Quote from Yesterday
  {{dd2}}
  {{dd3}}
    Tomorrow is not promised
  {{dd4}}
{{dd5}}`,
        dropdowns: [
          { options: ['<div>', '<h1>', '<p>', '<span>'], answer: '<div>' },
          { options: ['<h1>', '<div>', '<p>', '<quote>'], answer: '<h1>' },
          { options: ['</h1>', '</div>', '</p>', '</quote>'], answer: '</h1>' },
          { options: ['<p>', '<h1>', '<div>', '<br>'], answer: '<p>' },
          { options: ['</p>', '</h1>', '</div>', '</br>'], answer: '</p>' },
          { options: ['</div>', '</h1>', '</p>', '</span>'], answer: '</div>' }
        ],
        explanation: `Wrap the section in <div>...</div>, the heading in <h1>...</h1>, and the one-line quote in a paragraph <p>...</p>.`
      },

      // Q23
      {
        id: 23,
        type: 'mcq',
        category: 'HTML Fundamentals',
        prompt: `Which code shows the correct way to nest tags in HTML5?`,
        options: [
          { id: 'A', code: '<p>This is HTML5<strong><em>text formatting</em></strong></p>' },
          { id: 'B', code: '<p>This is HTML5<strong><em>text formatting</p></em></strong>' },
          { id: 'C', code: '<p>This is HTML5<strong><em>text formatting</p></strong></em>' },
          { id: 'D', code: '<p>This is HTML5<strong><em>text formatting</strong></em></p>' }
        ],
        answer: 'A',
        explanation: `HTML tags must be closed in the reverse order they were opened (Last-In, First-Out): <p> -> <strong> -> <em> -> </em> -> </strong> -> </p>.`
      },

      // Q24
      {
        id: 24,
        type: 'dropdown-code',
        category: 'Document Structure using HTML',
        prompt: `You are designing a web page that tests a user's ability to remember a list of ordered items in a particular category. The page must contain a heading that displays the category and a list of items in that category. An example is shown in the exhibit. (Select the Exhibit tab.)\nComplete the markup by selecting the correct option from each drop-down list.`,
        exhibitHtml: `
          <div class="border border-slate-400 rounded-lg overflow-hidden max-w-lg bg-white shadow-xs">
            <div class="bg-slate-200 border-b border-slate-400 px-2 pt-1.5 flex items-center gap-1 text-xs font-bold">
              <button type="button" id="q24TabPromptBtn" onclick="switchQ24Tab('exhibit')" class="px-3 py-1 rounded-t bg-white text-slate-900 border-t border-x border-slate-400 -mb-px">
                🖼️ Question Exhibit
              </button>
              <button type="button" id="q24TabSourceBtn" onclick="switchQ24Tab('info')" class="px-3 py-1 rounded-t bg-slate-100 text-slate-600 hover:bg-white/70 border-t border-x border-transparent">
                ℹ️ Exhibit Details
              </button>
            </div>
            <div id="q24ExhibitPane" class="p-4 bg-white font-serif text-slate-900">
              <div class="text-2xl font-bold mb-2">Fruit</div>
              <ol class="list-decimal list-inside text-sm mb-3 pl-1 space-y-0.5">
                <li>Apple</li>
                <li>Pear</li>
                <li>Orange</li>
              </ol>
              <p class="text-sm leading-relaxed">
                This page will test your ability to remember the order of the preceding items.<br>
                Glance at the list for 3 seconds.<br>
                Then close your eyes and recite the items in the order listed.
              </p>
            </div>
            <div id="q24InfoPane" class="hidden p-4 bg-slate-50 text-xs text-slate-700 space-y-1">
              <div><strong>Heading:</strong> Top-level heading (<code class="code-font">&lt;h1&gt;Fruit&lt;/h1&gt;</code>)</div>
              <div><strong>List Type:</strong> Numbered / Ordered list (<code class="code-font">&lt;ol&gt;</code> with <code class="code-font">&lt;li&gt;</code> items)</div>
              <div><strong>Instructions:</strong> Paragraph block (<code class="code-font">&lt;p&gt;...&lt;/p&gt;</code>) separated by line breaks</div>
            </div>
          </div>
        `,
        codeTemplate: `&lt;{{dd0}}&gt;Fruit&lt;/{{dd1}}&gt;
&lt;{{dd2}}&gt;
  &lt;li&gt;Apple&lt;/li&gt;
  &lt;li&gt;Pear&lt;/li&gt;
  &lt;li&gt;Orange&lt;/li&gt;
&lt;/{{dd3}}&gt;
&lt;br&gt;
&lt;{{dd4}}&gt;
This page will test your ability to remember the order of the preceding items.&lt;br&gt;
Glance at the list for 3 seconds.&lt;br&gt;
Then close your eyes and recite the items in the order listed.
&lt;/{{dd5}}&gt;`,
        dropdowns: [
          { options: ['h1', 'ol', 'ul', 'p', 'li'], answer: 'h1' },
          { options: ['h1', 'ol', 'ul', 'p', 'li'], answer: 'h1' },
          { options: ['ol', 'ul', 'h1', 'p', 'li'], answer: 'ol' },
          { options: ['ol', 'ul', 'h1', 'p', 'li'], answer: 'ol' },
          { options: ['p', 'h1', 'ol', 'ul', 'li'], answer: 'p' },
          { options: ['p', 'h1', 'ol', 'ul', 'li'], answer: 'p' }
        ],
        explanation: `Use <h1>...</h1> for the category heading, <ol>...</ol> for the ordered (numbered) list, and <p>...</p> for the paragraph instructions.`
      },

      // Q25
      {
        id: 25,
        type: 'true-false',
        category: 'Webpage Styling using CSS',
        prompt: `For each statement about responsive layouts, select True or False.`,
        statements: [
          { text: 'Media queries are used to create breakpoints', answer: 'True' },
          { text: 'Viewport settings are added to the <style> element', answer: 'False' },
          { text: 'Grid layouts are created by setting the width property to pixels', answer: 'False' }
        ],
        explanation: `• Media queries (@media) define responsive breakpoints (True).\n• Viewport settings are added via <meta name="viewport"> in <head>, not inside <style> (False).\n• Responsive grid layouts use relative units (%, fr, vw), not fixed pixel widths (False).`
      },

      // Q26
      {
        id: 26,
        type: 'mcq',
        category: 'Webpage Styling using CSS',
        prompt: `Which code segment correctly sets the background to an image that is sized to fill the entire background?`,
        options: [
          { id: 'A', code: `#div1 {\n  background: url(flower.jpg);\n  background-size: cover;\n}` },
          { id: 'B', code: `#div1 {\n  background: img(flower.jpg);\n  background-size: 200px;\n}` },
          { id: 'C', code: `#div1 {\n  background: img(flower.jpg);\n  background-size: contain;\n}` },
          { id: 'D', code: `#div1 {\n  background: url(flower.jpg);\n  background-size: auto;\n}` }
        ],
        answer: 'A',
        explanation: `CSS uses url(flower.jpg) to reference an image and background-size: cover to scale the image to completely cover the background area.`
      },

      // Q27
      {
        id: 27,
        type: 'dropdown-code',
        category: 'HTML Fundamentals',
        prompt: `You are creating an image link to the clients.html page. When the visitor clicks on the clients.gif graphic, the clients.html page must display in a new window. The graphic must provide text for screen readers and display text while the page is loading.\nComplete the markup by selecting the correct option from each drop-down list.`,
        codeTemplate: `&lt;a {{dd0}}&gt;
  &lt;img {{dd1}} /&gt;
&lt;/a&gt;`,
        dropdowns: [
          {
            options: [
              'href="clients.html" target="_blank"',
              'src="clients.html" target="_blank"',
              'href="clients.html" target="new"',
              'link="clients.html" target="_self"'
            ],
            answer: 'href="clients.html" target="_blank"'
          },
          {
            options: [
              'src="clients.gif" alt="Clients image"',
              'href="clients.gif" alt="Clients image"',
              'src="clients.gif" title="Clients image"',
              'img="clients.gif" alt="Clients image"'
            ],
            answer: 'src="clients.gif" alt="Clients image"'
          }
        ],
        explanation: `The <a> tag uses href="clients.html" and target="_blank" to open in a new window/tab. The <img> tag uses src="clients.gif" and alt="Clients image" for screen readers and loading text.`
      },

      // Q28
      {
        id: 28,
        type: 'true-false',
        category: 'Document Structure using HTML',
        prompt: `For each markup segment, select True if the HTML element belongs in the head block, or False if it does not.`,
        statements: [
          { text: '<style> h1 {color:red;} </style>', answer: 'True' },
          { text: '<title>Contact Information</title>', answer: 'True' },
          { text: '<link rel="stylesheet" href="default.css" />', answer: 'True' },
          { text: '<h1>Welcome</h1>', answer: 'False' },
          { text: '<!DOCTYPE html>', answer: 'False' }
        ],
        explanation: `<style>, <title>, and <link> belong inside <head>. <h1> belongs in <body>, and <!DOCTYPE html> goes at the very top before <html>.`
      },

      // Q29
      {
        id: 29,
        type: 'dropdown-code',
        category: 'Webpage Styling using CSS',
        prompt: `You are designing a web page for your company. The page must be responsive so that it can be viewed on both mobile and desktop browsers.\n• On browsers with a screen width of at least 768 pixels, you need to display a welcome background image named NormalLogo.png\n• On all other browsers, you need to display a welcome background image named SmallLogo.png\n\nComplete the markup by selecting the correct option from each drop-down list.`,
        codeTemplate: `.welcome {
  background-image: url("{{dd0}}");
}
@media only screen and (min-width: {{dd1}}) {
  .welcome {
    background-image: url("{{dd2}}");
  }
}`,
        dropdowns: [
          { options: ['SmallLogo.png', 'NormalLogo.png'], answer: 'SmallLogo.png' },
          { options: ['768px', '767px', '1024px', '480px'], answer: '768px' },
          { options: ['NormalLogo.png', 'SmallLogo.png'], answer: 'NormalLogo.png' }
        ],
        explanation: `Mobile-first CSS sets the default .welcome background to "SmallLogo.png", and then @media only screen and (min-width: 768px) overrides it with "NormalLogo.png" for screens 768px and wider.`
      },

      // Q30
      {
        id: 30,
        type: 'dropdown-code',
        category: 'Multimedia Presentation using HTML',
        prompt: `The Jazz Club wants you to add an image to the company home page. The image should be 100 pixels wide by 50 pixels high. The home page should display the company name if the image cannot be loaded.\nComplete the markup by selecting the correct option from each drop-down list.`,
        codeTemplate: `&lt;img {{dd0}}="companyLogo.jpg" {{dd1}}="The Jazz Club" {{dd2}} {{dd3}} /&gt;`,
        dropdowns: [
          { options: ['src', 'href', 'alt', 'url'], answer: 'src' },
          { options: ['alt', 'title', 'src', 'name'], answer: 'alt' },
          { options: ['width="100"', 'height="100"', 'size="100"', 'style="100"'], answer: 'width="100"' },
          { options: ['height="50"', 'width="50"', 'size="50"', 'style="50"'], answer: 'height="50"' }
        ],
        explanation: `<img src="companyLogo.jpg" alt="The Jazz Club" width="100" height="50" /> specifies the image source, fallback company name text, 100px width, and 50px height.`
      },

      // Q31
      {
        id: 31,
        type: 'mcq',
        category: 'CSS Fundamentals',
        prompt: `Analyze the following CSS for a web page:\n<pre class="code-font text-xs bg-slate-100 p-3 rounded border border-slate-300 mt-2">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;style&gt;
p {
  background-color: blue;
}
.light {
  background-color: yellow;
}
.light p {
  background-color: green;
}
&lt;/style&gt;
&lt;/head&gt;
&lt;body style="background-color:pink"&gt;
&lt;div class="light"&gt;
  &lt;p&gt;This is some sample text&lt;/p&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</pre>\nWhat is the resulting background color of the text "This is some sample text"?`,
        options: [
          { id: 'A', text: 'yellow' },
          { id: 'B', text: 'blue' },
          { id: 'C', text: 'green' },
          { id: 'D', text: 'pink' }
        ],
        answer: 'C',
        explanation: `The descendant selector .light p has higher specificity (1 class + 1 element) than p (1 element), so the <p> inside <div class="light"> gets background-color: green.`
      },

      // Q32
      {
        id: 32,
        type: 'mcq',
        category: 'Webpage Styling using CSS',
        prompt: `Which CSS code fragment centers an image horizontally?`,
        options: [
          { id: 'A', code: 'img.center { display: block; margin-left: auto; margin-right: auto; }' },
          { id: 'B', code: 'img.center { display: block; }' },
          { id: 'C', code: 'img.center { display: block; text-align: center; }' },
          { id: 'D', code: 'img.center { text-align: center; }' }
        ],
        answer: 'A',
        explanation: `To center an <img> element horizontally using margin, make it a block-level element (display: block;) and set both margin-left: auto; and margin-right: auto;.`
      },

      // Q33
      {
        id: 33,
        type: 'drag-code',
        category: 'HTML Fundamentals',
        prompt: `You are creating an HTML page for your company.\nYou need to include a comment that specifies the revision number and date.\nHow should you complete the markup? To answer, move the appropriate markup segments from the list on the left to the correct positions on the right.`,
        bankTitle: 'HTML Segments',
        bank: ['<!--', '-->', '/*', '*/', '//', '<!'],
        codeTemplate: `{{slot0}} Revision 1 on July 24, 2017 {{slot1}}`,
        slotAnswers: ['<!--', '-->'],
        explanation: `HTML comments start with <!-- and end with -->.`
      },

      // Q34
      {
        id: 34,
        type: 'dropdown-code',
        category: 'Multimedia Presentation using HTML',
        prompt: `You need a different image to display for different screen sizes.\nComplete the markup by selecting the correct option from each drop-down list.`,
        codeTemplate: `&lt;picture&gt;
  &lt;{{dd0}} media="(min-width: 1080px)" srcset="family.png"&gt;
  &lt;{{dd1}} media="(min-width: 768px)" srcset="family.jpg"&gt;
  &lt;img {{dd2}}="family.gif" alt="Family portrait" style="width: auto"&gt;
&lt;/picture&gt;`,
        dropdowns: [
          { options: ['source', 'img', 'picture', 'media'], answer: 'source' },
          { options: ['source', 'img', 'picture', 'media'], answer: 'source' },
          { options: ['src', 'srcset', 'href', 'url'], answer: 'src' }
        ],
        explanation: `Inside a <picture> element, <source> tags define media conditions and srcset files, while the fallback <img> tag uses the standard src attribute.`
      },

      // Q35
      {
        id: 35,
        type: 'drag-code',
        category: 'Document Structure using HTML',
        prompt: `You are creating an HTML page that gives instructions for climbing Mt. Everest.\nYou must create content that a browser renders according to its meaning. A portion of the content is shown as follows:`,
        exhibitHtml: `
          <div class="p-4 bg-white border-2 border-slate-300 rounded max-w-lg font-serif shadow-xs">
            <nav class="text-sm text-blue-800 mb-3">
              <span class="underline cursor-pointer">Climbing</span> |
              <span class="underline cursor-pointer">Supplies</span> |
              <span class="underline cursor-pointer">Safety</span> |
              <span class="underline cursor-pointer">Tips</span>
            </nav>
            <div class="text-2xl font-bold text-slate-900 mb-3">Climbing Mt. Everest</div>
            <div class="pl-4">
              <div class="w-full max-w-[360px] h-[200px] rounded-xs overflow-hidden border border-slate-400 shadow-sm relative bg-[#0b2254]">
                <svg viewBox="0 0 400 250" class="w-full h-full block" preserveAspectRatio="none" role="img" aria-label="Mt. Everest">
                  <defs>
                    <linearGradient id="everestSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#051336"/>
                      <stop offset="45%" stop-color="#143a78"/>
                      <stop offset="85%" stop-color="#6fa0c7"/>
                      <stop offset="100%" stop-color="#cbd5e1"/>
                    </linearGradient>
                    <linearGradient id="snowSunlit" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stop-color="#ffffff"/>
                      <stop offset="65%" stop-color="#e2e8f0"/>
                      <stop offset="100%" stop-color="#94a3b8"/>
                    </linearGradient>
                    <linearGradient id="snowShadow" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stop-color="#cbd5e1"/>
                      <stop offset="55%" stop-color="#64748b"/>
                      <stop offset="100%" stop-color="#334155"/>
                    </linearGradient>
                    <filter id="cloudBlur" x="-10%" y="-10%" width="120%" height="120%">
                      <feGaussianBlur stdDeviation="8" />
                    </filter>
                  </defs>
                  <!-- Deep high-altitude sky -->
                  <rect width="400" height="250" fill="url(#everestSky)"/>
                  <!-- Atmospheric clouds behind peak -->
                  <ellipse cx="265" cy="95" rx="95" ry="42" fill="#e2e8f0" opacity="0.55" filter="url(#cloudBlur)"/>
                  <ellipse cx="115" cy="145" rx="90" ry="38" fill="#cbd5e1" opacity="0.6" filter="url(#cloudBlur)"/>
                  <!-- Distant right ridge -->
                  <polygon points="270,250 365,150 400,175 400,250" fill="#94a3b8"/>
                  <polygon points="365,150 385,180 350,210 315,250 270,250" fill="#cbd5e1"/>
                  <!-- Main Mt. Everest Peak (Left shadowed face + Right sunlit snow face) -->
                  <polygon points="35,250 135,115 192,68 205,250" fill="url(#snowShadow)"/>
                  <polygon points="192,68 245,98 340,192 385,250 195,250" fill="url(#snowSunlit)"/>
                  <!-- Dark rocky crags along central spine & summit -->
                  <polygon points="192,68 175,92 188,118 178,155 190,210 196,250 206,250 203,185 212,145 198,108 208,85" fill="#1e293b" opacity="0.82"/>
                  <polygon points="160,115 182,95 190,122 152,140" fill="#334155" opacity="0.75"/>
                  <polygon points="205,125 245,148 268,172 225,165 202,145" fill="#334155" opacity="0.7"/>
                  <!-- Mist / Cloud bank at base & left slope -->
                  <ellipse cx="110" cy="215" rx="125" ry="45" fill="#cbd5e1" opacity="0.82" filter="url(#cloudBlur)"/>
                  <ellipse cx="260" cy="235" rx="135" ry="30" fill="#e2e8f0" opacity="0.75" filter="url(#cloudBlur)"/>
                </svg>
              </div>
            </div>
          </div>
        `,
        bankTitle: 'HTML Semantic Tags',
        bank: ['nav', 'figure', 'table', 'figcaption', 'header'],
        codeTemplate: `&lt;{{slot0}}&gt;
  &lt;a href="Climbing.html"&gt;Climbing&lt;/a&gt; |
  &lt;a href="Supplies.html"&gt;Supplies&lt;/a&gt; |
  &lt;a href="Safety.html"&gt;Safety&lt;/a&gt; |
  &lt;a href="Tips.html"&gt;Tips&lt;/a&gt;
&lt;/{{slot1}}&gt;
&lt;{{slot2}}&gt;
  &lt;h1&gt;Climbing Mt. Everest&lt;/h1&gt;
&lt;/{{slot3}}&gt;
&lt;{{slot4}}&gt;
  &lt;img src="everest.jpg" alt="Mt. Everest" width="400" height="250"&gt;
&lt;/{{slot5}}&gt;`,
        slotAnswers: ['nav', 'nav', 'header', 'header', 'figure', 'figure'],
        explanation: `Use <nav>...</nav> for the navigation links, <header>...</header> for the introductory heading section, and <figure>...</figure> to wrap the standalone image.`
      },

      // Q36
      {
        id: 36,
        type: 'line-select',
        category: 'Accessibility, Readability, and Testing',
        prompt: `A style is not applied to the document because of a syntax error.\nIn the answer area, select the line of code to highlight the error.`,
        lines: [
          `<style>`,
          `body {`,
          `    font-family: "Lucida Sans", "Lucida Sans Regular", Geneva, Verdana, sans-serif;`,
          `    font-size:12pt;`,
          `    background: linen;`,
          `}`,
          `header h1 {`,
          `    border: 5px inset brown;`,
          `    padding: 10px;`,
          `    border-radius:20px;`,
          `    text-align:center;`,
          `    font-size:150%;`,
          `    text-shadow: 1px 1px brown;`,
          `}`,
          `h2, h3 {`,
          `    color:b37a00;`,
          `    font-size:1.75em;`,
          `}`,
          `div>p {`,
          `    text-align:left;`,
          `    font-size:2vw;`,
          `}`,
          `</style>`
        ],
        correctLines: [15],
        explanation: `Line 16 ("color:b37a00;") contains the CSS syntax error because hexadecimal color values require a leading '#' symbol (color: #b37a00;). The following line ("font-size:1.75em;") is valid CSS.`
      },

      // Q37
      {
        id: 37,
        type: 'drag-sequence',
        category: 'Document Structure using HTML',
        prompt: `You need to create the following web page:\nMove the markup segments to the answer area and place them in the correct order.`,
        exhibitHtml: `
          <div class="p-5 bg-white border-2 border-slate-300 rounded max-w-lg font-serif text-slate-900 space-y-2.5 shadow-xs">
            <div class="text-xs text-blue-800 space-x-1">
              <span class="underline">Home</span>
              <span class="underline">About Us</span>
              <span class="underline">Contact Us</span>
            </div>
            <div class="text-xl font-bold">Our Mission</div>
            <p class="text-xs sm:text-sm">Healthy Eats -- your #1 source of specialty food items and beverages.</p>
            <div class="pl-6 py-2">
              <svg viewBox="0 0 300 195" class="w-44 h-28 block" role="img" aria-label="Healthy Eats logo">
                <defs>
                  <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ecfccb"/>
                    <stop offset="55%" stop-color="#bef264"/>
                    <stop offset="100%" stop-color="#84cc16"/>
                  </linearGradient>
                </defs>
                <!-- Outer stylized green leaf-oval emblem matching the reviewer exhibit -->
                <path d="M 35,120 C 25,55 110,20 255,25 C 245,120 185,175 65,165 C 42,162 28,150 20,170 C 25,148 32,135 35,120 Z"
                      fill="url(#leafGrad)" stroke="#4d7c0f" stroke-width="3.5"/>
                <path d="M 25,168 C 75,135 155,125 235,55" fill="none" stroke="#65a30d" stroke-width="2" opacity="0.45"/>
                <text x="142" y="92" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="bold" fill="#365314">Healthy</text>
                <text x="142" y="128" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="bold" fill="#365314">Eats</text>
              </svg>
            </div>
            <div class="text-base font-bold">Fresh Tastes on Your Table</div>
            <div class="text-xl font-bold pt-1">Our Guarantee</div>
            <p class="text-xs sm:text-sm leading-relaxed">
              Healthy Eats offers organically grown produce 24 hours a day, 7 days a week, 365 days a year.
            </p>
            <hr class="border-slate-400 my-2">
            <div class="text-xs text-slate-800">Copyright (c) 2021, Healthy Eats</div>
          </div>
        `,
        bankTitle: 'Markup Segments',
        bank: [
          `<summary>\n  <figure>\n    <img src="images/HealthyEatsLogo.png" alt="Healthy Eats logo"\n      width="300" height="195">\n  </figure>\n  <figcaption>Healthy Eats Logo</figcaption>\n  <h2>\n    Fresh Tastes on Your Table\n  </h2>\n</summary>`,
          `<footer>\n  <h1>Our Guarantee</h1>\n  <p>\n    Healthy Eats offers organically grown produce 24 hours a day,\n7 days a week, 365 days a year.\n  </p>\n</footer>`,
          `<footer>\n  <hr>\n  Copyright (c) 2021, Healthy Eats\n</footer>`,
          `<article>\n  <h1>Our Guarantee</h1>\n  <p>\n    Healthy Eats offers organically grown produce 24 hours a day,\n7 days a week, 365 days a year.\n  </p>\n</article>`,
          `<article>\n  <h1>Our Mission</h1>\n  <p>\n    Healthy Eats -- your #1 source of specialty food items and beverages.\n  </p>\n</article>`,
          `<article>\n  <figure>\n    <img src="Images/HealthyEatsLogo.png" alt="Healthy Eats logo" width="300" height="195">\n  </figure>\n  <h2>\n    Fresh Tastes on Your Table\n  </h2>\n</article>`,
          `<nav>\n  <a href="#">Home</a>\n  <a href="#">About Us</a>\n  <a href="#">Contact Us</a>\n</nav>`
        ],
        sequenceAnswers: [
          `<nav>\n  <a href="#">Home</a>\n  <a href="#">About Us</a>\n  <a href="#">Contact Us</a>\n</nav>`,
          `<article>\n  <h1>Our Mission</h1>\n  <p>\n    Healthy Eats -- your #1 source of specialty food items and beverages.\n  </p>\n</article>`,
          `<article>\n  <figure>\n    <img src="Images/HealthyEatsLogo.png" alt="Healthy Eats logo" width="300" height="195">\n  </figure>\n  <h2>\n    Fresh Tastes on Your Table\n  </h2>\n</article>`,
          `<article>\n  <h1>Our Guarantee</h1>\n  <p>\n    Healthy Eats offers organically grown produce 24 hours a day,\n7 days a week, 365 days a year.\n  </p>\n</article>`,
          `<footer>\n  <hr>\n  Copyright (c) 2021, Healthy Eats\n</footer>`
        ],
        explanation: `Order top to bottom: <nav> with the three links, <article> "Our Mission", <article> with the logo <figure> and the <h2> tagline, <article> "Our Guarantee", and finally <footer> with <hr> and the copyright. <summary> is the wrong element for the logo section (it belongs inside <details>), and "Our Guarantee" is main content, so it goes in an <article>, not the <footer>. (Note: the PDF screenshots were partly cut off, so the exact segment wording is reconstructed.)`
      },

      // Q38
      {
        id: 38,
        type: 'dropdown-code',
        category: 'Webpage Styling using CSS',
        prompt: `You need to apply a thick, double red border with 20px rounded corners to heading 1 text.\nComplete the CSS style by selecting the correct option from each drop-down list.`,
        codeTemplate: `&lt;style&gt;
h1 {
  {{dd0}}: thick double red;
  {{dd1}}: 20px;
}
&lt;/style&gt;`,
        dropdowns: [
          { options: ['border', 'border-style', 'border-width', 'outline'], answer: 'border' },
          { options: ['border-radius', 'corner-radius', 'border-corner', 'border-round'], answer: 'border-radius' }
        ],
        explanation: `The shorthand property "border: thick double red;" sets width, style, and color at once, and "border-radius: 20px;" rounds the corners.`
      },

      // Q39
      {
        id: 39,
        type: 'mcq',
        category: 'HTML Fundamentals',
        prompt: `Which HTML5 code fragment shows a way to validate numeric input as having a value from 1 to 100, inclusive?`,
        options: [
          { id: 'A', code: '<input type="number" low="1" high="100">' },
          { id: 'B', code: '<input type="positive" limit="100">' },
          { id: 'C', code: '<input type="number" min="1" max="100">' },
          { id: 'D', code: '<input type="num" min="1" max="100">' }
        ],
        answer: 'C',
        explanation: `<input type="number" min="1" max="100"> validates numeric input between 1 and 100 inclusive.`
      },

      // Q40
      {
        id: 40,
        type: 'drag-sequence',
        category: 'Document Structure using HTML',
        prompt: `You are creating a website for The Photo Club. The website will have The Photo Club appear on the browser tab. There will also be a paragraph that greets users to the site.\nYou need to create the structure of the website.\nMove all the markup segments to the answer area and place them in the correct order.`,
        bankTitle: 'Markup Segments',
        bank: [
          '<body>\n<p>Welcome to The Photo Club website.</p>',
          '</head>',
          '<!DOCTYPE html>',
          '</html>',
          '<title>The Photo Club</title>',
          '<html>',
          '</body>',
          '<head>'
        ],
        sequenceAnswers: [
          '<!DOCTYPE html>',
          '<html>',
          '<head>',
          '<title>The Photo Club</title>',
          '</head>',
          '<body>\n<p>Welcome to The Photo Club website.</p>',
          '</body>',
          '</html>'
        ],
        explanation: `Place the 8 segments in standard HTML5 document order: 1) <!DOCTYPE html>, 2) <html>, 3) <head>, 4) <title>The Photo Club</title>, 5) </head>, 6) <body><p>Welcome...</p>, 7) </body>, 8) </html>.`
      }
    ];
