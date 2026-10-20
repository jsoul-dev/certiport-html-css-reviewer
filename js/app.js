
    // ============================================================================
    // APPLICATION STATE & LOCALSTORAGE PERSISTENCE
    // ============================================================================
    const STORAGE_KEY = 'its_html_css_reviewer_state_v3';
    const LEGACY_STORAGE_KEY = 'its_html_css_reviewer_state_v2';
    let examMode = 'practice'; // 'practice' | 'exam'
    let instantCheck = true;
    let activeQuestionIds = QUESTIONS.map(q => q.id);
    let currentIndex = 0; // index inside activeQuestionIds
    let selectedBankItem = null; // For click-to-place in drag & drop questions

    // Per-question user state keyed by question ID (1..40+)
    const userState = {};

    // Timer state (50 minutes default like Certiport ITS exam)
    let timerSeconds = 50 * 60;
    let timerPaused = false;
    let currentStreak = 0;

    function initUserState() {
      QUESTIONS.forEach(q => {
        userState[q.id] = createEmptyStateForQuestion(q);
      });
    }

    function saveStateToStorage() {
      try {
        const customClones = QUESTIONS.filter(q => q.isAIClone);
        const payload = {
          examMode,
          instantCheck,
          activeQuestionIds,
          currentIndex,
          timerSeconds,
          currentStreak,
          userState,
          customClones,
          savedAt: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        const badge = document.getElementById('autoSaveBadge');
        if (badge) {
          badge.textContent = '💾 Auto-saved';
          badge.classList.remove(' opacity-60');
        }
      } catch (e) {
        // Ignore quota or private-browsing storage restrictions
      }
    }

    function loadStateFromStorage() {
      try {
        let raw = localStorage.getItem(STORAGE_KEY);
        let isFromLegacy = false;
        if (!raw) {
          raw = localStorage.getItem(LEGACY_STORAGE_KEY);
          if (raw) isFromLegacy = true;
        }
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!data || typeof data !== 'object') return false;

        // Restore any AI Clone questions generated in previous sessions
        if (Array.isArray(data.customClones)) {
          data.customClones.forEach(cloneQ => {
            if (!QUESTIONS.some(q => q.id === cloneQ.id)) {
              QUESTIONS.push(cloneQ);
            }
          });
        }

        // Initialize defaults first, then overlay saved state
        initUserState();
        if (data.userState && typeof data.userState === 'object') {
          Object.keys(data.userState).forEach(k => {
            const qId = Number(k);
            if (userState[qId]) {
              userState[qId] = { ...userState[qId], ...data.userState[k] };
            }
          });
        }

        if (data.examMode === 'practice' || data.examMode === 'exam') {
          examMode = data.examMode;
        }
        if (isFromLegacy || typeof data.instantCheck !== 'boolean') {
          instantCheck = true;
        } else {
          instantCheck = data.instantCheck;
        }
        const instantToggle = document.getElementById('instantCheckToggle');
        if (instantToggle) instantToggle.checked = instantCheck;

        if (Array.isArray(data.activeQuestionIds) && data.activeQuestionIds.length > 0) {
          const validIds = data.activeQuestionIds.filter(id => QUESTIONS.some(q => q.id === id));
          if (validIds.length > 0) activeQuestionIds = validIds;
        }
        if (typeof data.currentIndex === 'number' && data.currentIndex >= 0 && data.currentIndex < activeQuestionIds.length) {
          currentIndex = data.currentIndex;
        }
        if (typeof data.timerSeconds === 'number' && data.timerSeconds > 0) {
          timerSeconds = data.timerSeconds;
        }
        if (typeof data.currentStreak === 'number') {
          currentStreak = data.currentStreak;
        }
        return true;
      } catch (e) {
        return false;
      }
    }

    function switchQ24Tab(tab) {
      const exhibitPane = document.getElementById('q24ExhibitPane');
      const infoPane = document.getElementById('q24InfoPane');
      const promptBtn = document.getElementById('q24TabPromptBtn');
      const sourceBtn = document.getElementById('q24TabSourceBtn');
      if (!exhibitPane || !infoPane) return;
      if (tab === 'exhibit') {
        exhibitPane.classList.remove('hidden');
        infoPane.classList.add('hidden');
        promptBtn.className = 'px-3 py-1 rounded-t bg-white text-slate-900 border-t border-x border-slate-400 -mb-px';
        sourceBtn.className = 'px-3 py-1 rounded-t bg-slate-100 text-slate-600 hover:bg-white/70 border-t border-x border-transparent';
      } else {
        exhibitPane.classList.add('hidden');
        infoPane.classList.remove('hidden');
        sourceBtn.className = 'px-3 py-1 rounded-t bg-white text-slate-900 border-t border-x border-slate-400 -mb-px';
        promptBtn.className = 'px-3 py-1 rounded-t bg-slate-100 text-slate-600 hover:bg-white/70 border-t border-x border-transparent';
      }
    }

    function updateFilterOptionCounts() {
      const sel = document.getElementById('filterSelect');
      if (!sel) return;
      const total = QUESTIONS.length;
      const ddCount = QUESTIONS.filter(q => q.type.startsWith('dropdown-')).length;
      const mcqCount = QUESTIONS.filter(q => q.type === 'mcq' || q.type === 'multi-select').length;
      const dragCount = QUESTIONS.filter(q => q.type.startsWith('drag-')).length;
      const tfCount = QUESTIONS.filter(q => q.type === 'true-false').length;
      const lineCount = QUESTIONS.filter(q => q.type === 'line-select').length;
      const wrongCount = QUESTIONS.filter(q => !userState[q.id]?.checked || !userState[q.id]?.isCorrect).length;
      const markedCount = QUESTIONS.filter(q => userState[q.id]?.markedReview).length;

      const labels = {
        all: `All Questions (${total})`,
        dropdown: `Drop-down Lists Only (${ddCount})`,
        mcq: `Multiple Choice Only (${mcqCount})`,
        drag: `Drag & Drop Only (${dragCount})`,
        tf: `True / False Table Only (${tfCount})`,
        line: `Code Line Error Selection (${lineCount})`,
        wrong: `❌ Missed / Unmastered Only (${wrongCount})`,
        marked: `🚩 Marked for Review (${markedCount})`
      };
      Array.from(sel.options).forEach(opt => {
        if (labels[opt.value]) opt.textContent = labels[opt.value];
      });
    }

    function createEmptyStateForQuestion(q) {
      const base = {
        checked: false,
        isCorrect: false,
        scoreRatio: 0, // 0..1 (supports partial credit)
        markedReview: false,
        markedFeedback: false,
        partResults: []
      };
      if (q.type === 'dropdown-code') {
        base.values = q.dropdowns.map(() => '');
      } else if (q.type === 'dropdown-qa') {
        base.values = q.items.map(() => '');
      } else if (q.type === 'mcq') {
        base.value = '';
      } else if (q.type === 'multi-select') {
        base.values = [];
      } else if (q.type === 'true-false') {
        base.values = q.statements.map(() => '');
      } else if (q.type === 'drag-match') {
        base.values = q.targets.map(() => '');
      } else if (q.type === 'drag-code') {
        base.values = q.slotAnswers.map(() => '');
      } else if (q.type === 'drag-sequence') {
        base.values = q.sequenceAnswers.map(() => '');
      } else if (q.type === 'line-select') {
        base.value = null;
      }
      return base;
    }

    // ============================================================================
    // HELPER UTILITIES
    // ============================================================================
    function escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function getCurrentQuestion() {
      const qId = activeQuestionIds[currentIndex];
      return QUESTIONS.find(q => q.id === qId) || QUESTIONS[0];
    }

    function isQuestionAnswered(q) {
      const st = userState[q.id];
      if (!st) return false;
      if (q.type === 'mcq') return st.value !== '';
      if (q.type === 'multi-select') return st.values.length > 0;
      if (q.type === 'line-select') return st.value !== null;
      if (Array.isArray(st.values)) return st.values.some(v => v !== '');
      return false;
    }

    // ============================================================================
    // EVALUATION & PARTIAL CREDIT ENGINE
    // ============================================================================
    function evaluateQuestion(q, recordCheck = true) {
      const st = userState[q.id];
      let correctParts = 0;
      let totalParts = 1;
      let partResults = [];

      if (q.type === 'dropdown-code') {
        totalParts = q.dropdowns.length;
        q.dropdowns.forEach((dd, i) => {
          const ok = st.values[i] === dd.answer;
          if (ok) correctParts++;
          partResults.push(ok);
        });
      } else if (q.type === 'dropdown-qa') {
        totalParts = q.items.length;
        q.items.forEach((item, i) => {
          const ok = item.answer.includes(st.values[i]);
          if (ok) correctParts++;
          partResults.push(ok);
        });
      } else if (q.type === 'mcq') {
        totalParts = 1;
        const ok = st.value === q.answer;
        if (ok) correctParts = 1;
        partResults = [ok];
      } else if (q.type === 'multi-select') {
        totalParts = q.answer.length;
        // Count how many selected match and penalize extra wrong selections if any
        q.answer.forEach(ansId => {
          if (st.values.includes(ansId)) correctParts++;
        });
        const wrongSelections = st.values.filter(v => !q.answer.includes(v)).length;
        correctParts = Math.max(0, correctParts - wrongSelections);
        partResults = [correctParts === totalParts && st.values.length === totalParts];
      } else if (q.type === 'true-false') {
        totalParts = q.statements.length;
        q.statements.forEach((stmt, i) => {
          const ok = st.values[i] === stmt.answer;
          if (ok) correctParts++;
          partResults.push(ok);
        });
      } else if (q.type === 'drag-match') {
        totalParts = q.targets.length;
        q.targets.forEach((t, i) => {
          const ok = st.values[i] === t.answer;
          if (ok) correctParts++;
          partResults.push(ok);
        });
      } else if (q.type === 'drag-code') {
        totalParts = q.slotAnswers.length;
        q.slotAnswers.forEach((ans, i) => {
          const ok = st.values[i] === ans;
          if (ok) correctParts++;
          partResults.push(ok);
        });
      } else if (q.type === 'drag-sequence') {
        totalParts = q.sequenceAnswers.length;
        q.sequenceAnswers.forEach((ans, i) => {
          const ok = st.values[i] === ans;
          if (ok) correctParts++;
          partResults.push(ok);
        });
      } else if (q.type === 'line-select') {
        totalParts = 1;
        const ok = q.correctLines.includes(st.value);
        if (ok) correctParts = 1;
        partResults = [ok];
      }

      const ratio = totalParts > 0 ? correctParts / totalParts : 0;
      const allCorrect = correctParts === totalParts;

      if (recordCheck) {
        st.checked = true;
        st.isCorrect = allCorrect;
        st.scoreRatio = ratio;
        st.partResults = partResults;
      }

      return { correctParts, totalParts, ratio, allCorrect, partResults };
    }

    // ============================================================================
    // RENDER QUESTION WORKSPACE
    // ============================================================================
    function renderCurrentQuestion() {
      const q = getCurrentQuestion();
      const st = userState[q.id];
      selectedBankItem = null;

      // Top bar counters
      document.getElementById('questionCounterText').textContent =
        `Question ${q.id} of ${QUESTIONS.length}` +
        (q.isAIClone ? ` ✨ (AI Clone of Q${q.clonedFromId})` : '') +
        (activeQuestionIds.length < QUESTIONS.length ? ` [${currentIndex + 1}/${activeQuestionIds.length} filtered]` : '');
      document.getElementById('questionCategoryBadge').textContent = q.category;

      // Type badge
      const typeLabels = {
        'dropdown-code': 'Drop-down List in Markup',
        'dropdown-qa': 'Drop-down List Q&A',
        'mcq': 'Multiple Choice',
        'multi-select': `Multiple Selection (Choose ${q.chooseCount || 2})`,
        'true-false': 'True / False Matrix',
        'drag-match': 'Drag & Drop Matching',
        'drag-code': 'Drag & Drop Markup Completion',
        'drag-sequence': 'Drag & Drop Ordered Sequence',
        'line-select': 'Hot Area — Code Line Selection'
      };
      document.getElementById('qTypePill').textContent = typeLabels[q.type] || 'Exam Question';

      // Status badge
      const statusPill = document.getElementById('qStatusPill');
      if (examMode === 'practice' && st.checked) {
        statusPill.classList.remove('hidden');
        if (st.isCorrect) {
          statusPill.className = 'text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300';
          statusPill.textContent = '✓ Correct';
        } else if (st.scoreRatio > 0) {
          statusPill.className = 'text-xs font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300';
          statusPill.textContent = `◐ Partial Credit (${Math.round(st.scoreRatio * 100)}%)`;
        } else {
          statusPill.className = 'text-xs font-bold px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300';
          statusPill.textContent = '✕ Incorrect';
        }
      } else {
        statusPill.classList.add('hidden');
      }

      // Prompt & Exhibit
      const promptEl = document.getElementById('questionPrompt');
      promptEl.innerHTML = q.prompt.replace(/\n/g, '<br>');

      const exhibitEl = document.getElementById('questionExhibit');
      if (q.exhibitHtml) {
        exhibitEl.classList.remove('hidden');
        exhibitEl.innerHTML = q.exhibitHtml;
      } else {
        exhibitEl.classList.add('hidden');
        exhibitEl.innerHTML = '';
      }

      // Checkboxes in footer
      document.getElementById('markReviewCheckbox').checked = !!st.markedReview;
      document.getElementById('markFeedbackCheckbox').checked = !!st.markedFeedback;

      // Navigation buttons
      document.getElementById('prevBtn').disabled = currentIndex === 0;
      document.getElementById('nextBtn').textContent = currentIndex === activeQuestionIds.length - 1 ? 'Summary ▶' : 'Next ▶';

      // Hint text
      const hintEl = document.getElementById('interactionHint');
      if (q.type.startsWith('drag-')) {
        hintEl.innerHTML = '💡 <strong>Tip:</strong> Drag items OR click an item on the left then click a slot on the right. Click any filled slot to clear it.';
      } else if (q.type === 'line-select') {
        hintEl.innerHTML = '💡 <strong>Tip:</strong> Click directly on the line of code with the syntax error.';
      } else {
        hintEl.innerHTML = '';
      }

      // Render Answer Area by Question Type
      const container = document.getElementById('answerAreaContainer');
      container.innerHTML = '';

      if (q.type === 'dropdown-code') {
        renderDropdownCode(q, st, container);
      } else if (q.type === 'dropdown-qa') {
        renderDropdownQA(q, st, container);
      } else if (q.type === 'mcq' || q.type === 'multi-select') {
        renderMCQ(q, st, container);
      } else if (q.type === 'true-false') {
        renderTrueFalse(q, st, container);
      } else if (q.type === 'drag-match') {
        renderDragMatch(q, st, container);
      } else if (q.type === 'drag-code') {
        renderDragCode(q, st, container);
      } else if (q.type === 'drag-sequence') {
        renderDragSequence(q, st, container);
      } else if (q.type === 'line-select') {
        renderLineSelect(q, st, container);
      }

      // Render Feedback Banner if in practice mode and checked
      renderFeedbackBanner(q, st);
      updateTopStats();
      updateFilterOptionCounts();
      saveStateToStorage();
    }

    // ----------------------------------------------------------------------------
    // 1. RENDER DROPDOWN IN CODE
    // ----------------------------------------------------------------------------
    function renderDropdownCode(q, st, container) {
      let html = q.codeTemplate;
      q.dropdowns.forEach((dd, idx) => {
        const currentVal = st.values[idx] || '';
        let statusClass = '';
        if (examMode === 'practice' && st.checked) {
          statusClass = st.partResults[idx] ? 'select-correct' : 'select-wrong';
        }
        const optsHtml = [
          `<option value="">-- Select --</option>`,
          ...dd.options.map(opt => {
            const sel = currentVal === opt ? 'selected' : '';
            return `<option value="${escapeHtml(opt)}" ${sel}>${escapeHtml(opt)}</option>`;
          })
        ].join('');

        const selectMarkup = `<select onchange="handleDropdownCodeChange(${q.id}, ${idx}, this.value)" class="compass-select my-1 ${statusClass}">${optsHtml}</select>`;
        html = html.replace(`{{dd${idx}}}`, selectMarkup);
      });

      container.innerHTML = `
        <div class="bg-slate-50 border-2 border-slate-300 rounded-lg p-4 sm:p-5 overflow-x-auto">
          <pre class="code-font text-xs sm:text-sm leading-8 text-slate-900 whitespace-pre-wrap">${html}</pre>
        </div>
      `;
    }

    function handleDropdownCodeChange(qId, idx, val) {
      const q = QUESTIONS.find(x => x.id === qId);
      const st = userState[qId];
      st.values[idx] = val;
      st.checked = false;
      if (examMode === 'practice' && instantCheck && st.values.every(v => v !== '')) {
        checkCurrentAnswer();
      } else {
        renderCurrentQuestion();
      }
    }

    // ----------------------------------------------------------------------------
    // 2. RENDER DROPDOWN Q&A
    // ----------------------------------------------------------------------------
    function renderDropdownQA(q, st, container) {
      const rowsHtml = q.items.map((item, idx) => {
        const currentVal = st.values[idx] || '';
        let statusClass = '';
        if (examMode === 'practice' && st.checked) {
          statusClass = st.partResults[idx] ? 'select-correct' : 'select-wrong';
        }
        const optsHtml = [
          `<option value="">-- Select answer --</option>`,
          ...item.options.map(opt => {
            const sel = currentVal === opt ? 'selected' : '';
            return `<option value="${escapeHtml(opt)}" ${sel}>${escapeHtml(opt)}</option>`;
          })
        ].join('');

        return `
          <div class="p-3.5 bg-slate-50 border border-slate-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="text-sm font-medium text-slate-800">${escapeHtml(item.question)}</div>
            <select onchange="handleDropdownQAChange(${q.id}, ${idx}, this.value)" class="compass-select shrink-0 min-w-[230px] ${statusClass}">
              ${optsHtml}
            </select>
          </div>
        `;
      }).join('');

      container.innerHTML = `<div class="space-y-3 max-w-4xl">${rowsHtml}</div>`;
    }

    function handleDropdownQAChange(qId, idx, val) {
      const st = userState[qId];
      st.values[idx] = val;
      st.checked = false;
      if (examMode === 'practice' && instantCheck && st.values.every(v => v !== '')) {
        checkCurrentAnswer();
      } else {
        renderCurrentQuestion();
      }
    }

    // ----------------------------------------------------------------------------
    // 3. RENDER MULTIPLE CHOICE / MULTI-SELECT
    // ----------------------------------------------------------------------------
    function renderMCQ(q, st, container) {
      const isMulti = q.type === 'multi-select';
      const cardsHtml = q.options.map(opt => {
        const isSelected = isMulti ? st.values.includes(opt.id) : st.value === opt.id;
        const isCorrectOpt = isMulti ? q.answer.includes(opt.id) : q.answer === opt.id;

        let borderClass = isSelected ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-500/20' : 'border-slate-300 bg-white hover:bg-slate-50';
        let badgeHtml = '';

        if (examMode === 'practice' && st.checked) {
          if (isCorrectOpt) {
            borderClass = 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20';
            badgeHtml = `<span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">✓ Correct Option</span>`;
          } else if (isSelected && !isCorrectOpt) {
            borderClass = 'border-rose-600 bg-rose-50 ring-2 ring-rose-500/20';
            badgeHtml = `<span class="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">✕ Incorrect Selection</span>`;
          }
        }

        const contentHtml = opt.code
          ? `<pre class="code-font text-xs sm:text-sm bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto">${escapeHtml(opt.code)}</pre>`
          : `<span class="text-sm sm:text-base font-medium text-slate-800 code-font">${escapeHtml(opt.text)}</span>`;

        return `
          <div onclick="handleMCQSelect(${q.id}, '${opt.id}')" class="cursor-pointer border-2 rounded-lg p-3.5 transition flex items-start gap-3.5 ${borderClass}">
            <div class="pt-0.5 shrink-0 flex items-center gap-2">
              <input type="${isMulti ? 'checkbox' : 'radio'}" name="mcq_${q.id}" ${isSelected ? 'checked' : ''} class="w-4 h-4 text-sky-600 pointer-events-none" />
              <span class="font-bold text-sm text-slate-700">${opt.id}.</span>
            </div>
            <div class="flex-1 min-w-0 space-y-2">
              ${contentHtml}
              ${badgeHtml}
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `<div class="grid grid-cols-1 gap-3 max-w-4xl">${cardsHtml}</div>`;
    }

    function handleMCQSelect(qId, optId) {
      const q = QUESTIONS.find(x => x.id === qId);
      const st = userState[qId];
      st.checked = false;

      if (q.type === 'multi-select') {
        if (st.values.includes(optId)) {
          st.values = st.values.filter(x => x !== optId);
        } else {
          st.values.push(optId);
        }
        if (examMode === 'practice' && instantCheck && st.values.length === (q.chooseCount || 2)) {
          checkCurrentAnswer();
          return;
        }
      } else {
        st.value = optId;
        if (examMode === 'practice' && instantCheck) {
          checkCurrentAnswer();
          return;
        }
      }
      renderCurrentQuestion();
    }

    // ----------------------------------------------------------------------------
    // 4. RENDER TRUE / FALSE MATRIX
    // ----------------------------------------------------------------------------
    function renderTrueFalse(q, st, container) {
      const rowsHtml = q.statements.map((stmt, idx) => {
        const currentVal = st.values[idx];
        let rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
        let statusHtml = '';

        if (examMode === 'practice' && st.checked) {
          const ok = st.partResults[idx];
          rowBg = ok ? 'bg-emerald-50/80' : 'bg-rose-50/80';
          statusHtml = ok
            ? `<span class="ml-2 text-xs font-bold text-emerald-700">✓</span>`
            : `<span class="ml-2 text-xs font-bold text-rose-700">✕ (Ans: ${stmt.answer})</span>`;
        }

        return `
          <tr class="border-t border-slate-300 ${rowBg}">
            <td class="p-3.5 text-sm text-slate-800 font-medium">
              <span class="code-font">${escapeHtml(stmt.text)}</span>
              ${statusHtml}
            </td>
            <td class="p-3.5 text-center w-24 border-l border-slate-300">
              <input type="radio" name="tf_${q.id}_${idx}" ${currentVal === 'True' ? 'checked' : ''} onchange="handleTFChange(${q.id}, ${idx}, 'True')" class="w-4 h-4 text-sky-600 cursor-pointer" />
            </td>
            <td class="p-3.5 text-center w-24 border-l border-slate-300">
              <input type="radio" name="tf_${q.id}_${idx}" ${currentVal === 'False' ? 'checked' : ''} onchange="handleTFChange(${q.id}, ${idx}, 'False')" class="w-4 h-4 text-sky-600 cursor-pointer" />
            </td>
          </tr>
        `;
      }).join('');

      container.innerHTML = `
        <div class="overflow-x-auto max-w-4xl border-2 border-slate-400 rounded-lg">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-slate-200 text-slate-800 text-xs font-bold uppercase">
                <th class="p-3 text-left">Statement</th>
                <th class="p-3 text-center w-24 border-l border-slate-300">True</th>
                <th class="p-3 text-center w-24 border-l border-slate-300">False</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      `;
    }

    function handleTFChange(qId, idx, val) {
      const st = userState[qId];
      st.values[idx] = val;
      st.checked = false;
      if (examMode === 'practice' && instantCheck && st.values.every(v => v !== '')) {
        checkCurrentAnswer();
      } else {
        renderCurrentQuestion();
      }
    }

    // ----------------------------------------------------------------------------
    // 5. RENDER DRAG & DROP MATCHING (Q4, Q14)
    // ----------------------------------------------------------------------------
    function renderDragMatch(q, st, container) {
      const bankHtml = q.bank.map((item, idx) => {
        const isSel = selectedBankItem === item;
        return `
          <div draggable="true"
               ondragstart="onDragStartBank(event, ${idx})"
               onclick="selectBankTile(${idx})"
               class="drag-tile p-2.5 rounded code-font text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-between ${isSel ? 'selected-tile' : ''}">
            <span>${escapeHtml(item)}</span>
            <span class="text-[10px] text-slate-400 font-sans ml-2">⠿</span>
          </div>
        `;
      }).join('');

      const targetsHtml = q.targets.map((t, slotIdx) => {
        const val = st.values[slotIdx] || '';
        let statusClass = val ? 'filled' : '';
        if (examMode === 'practice' && st.checked) {
          statusClass += st.partResults[slotIdx] ? ' slot-correct' : ' slot-wrong';
        }
        return `
          <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-slate-50 p-3 rounded-lg border border-slate-300">
            <div class="md:col-span-7 text-xs sm:text-sm font-medium text-slate-800 code-font">${escapeHtml(t.label)}</div>
            <div class="md:col-span-5">
              <div ondragover="onDragOverSlot(event)"
                   ondragleave="onDragLeaveSlot(event)"
                   ondrop="onDropOnSlot(event, ${q.id}, ${slotIdx})"
                   onclick="onClickSlot(${q.id}, ${slotIdx})"
                   class="drop-slot rounded px-3 py-2 flex items-center justify-between cursor-pointer code-font text-xs sm:text-sm font-bold ${statusClass}">
                <span class="${val ? 'text-slate-900' : 'text-slate-400 font-sans font-normal italic'}">${val ? escapeHtml(val) : 'Drop or click here'}</span>
                ${val ? '<span class="text-xs text-slate-400 hover:text-rose-600" title="Click to clear">✕</span>' : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-4 bg-slate-100 p-4 rounded-lg border border-slate-300">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">${escapeHtml(q.bankTitle || 'Items')}</div>
            <div class="space-y-2">${bankHtml}</div>
          </div>
          <div class="lg:col-span-8 bg-white p-4 rounded-lg border border-slate-300">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-700">${escapeHtml(q.targetsTitle || 'Answer Area')}</span>
              <button onclick="resetCurrentQuestion()" class="text-xs text-sky-700 hover:underline font-medium">Clear All Slots</button>
            </div>
            <div class="space-y-3">${targetsHtml}</div>
          </div>
        </div>
      `;
    }

    // ----------------------------------------------------------------------------
    // 6. RENDER DRAG & DROP IN CODE (Q11, Q12, Q33, Q35, Q37)
    // ----------------------------------------------------------------------------
    function renderDragCode(q, st, container) {
      const bankHtml = q.bank.map((item, idx) => {
        const isSel = selectedBankItem === item;
        return `
          <div draggable="true"
               ondragstart="onDragStartBank(event, ${idx})"
               onclick="selectBankTile(${idx})"
               class="drag-tile p-2.5 rounded code-font text-xs leading-relaxed font-medium text-slate-800 whitespace-pre-wrap ${isSel ? 'selected-tile' : ''}">${escapeHtml(item)}</div>
        `;
      }).join('');

      let codeHtml = q.codeTemplate;
      q.slotAnswers.forEach((_, slotIdx) => {
        const val = st.values[slotIdx] || '';
        let statusClass = val ? 'filled' : '';
        if (examMode === 'practice' && st.checked) {
          statusClass += st.partResults[slotIdx] ? ' slot-correct' : ' slot-wrong';
        }
        const slotEl = `<span ondragover="onDragOverSlot(event)"
                              ondragleave="onDragLeaveSlot(event)"
                              ondrop="onDropOnSlot(event, ${q.id}, ${slotIdx})"
                              onclick="onClickSlot(${q.id}, ${slotIdx})"
                              class="drop-slot inline-flex items-center gap-2 px-2.5 py-1 my-1 rounded align-middle cursor-pointer code-font text-xs sm:text-sm font-bold min-w-[140px] ${statusClass}">${
                                val
                                  ? `<span class="whitespace-pre-wrap text-slate-900">${escapeHtml(val)}</span><span class="text-xs text-slate-400 ml-auto">✕</span>`
                                  : `<span class="text-slate-400 font-sans font-normal italic text-xs">[Slot ${slotIdx + 1}]</span>`
                              }</span>`;
        codeHtml = codeHtml.replace(`{{slot${slotIdx}}}`, slotEl);
      });

      container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-5 bg-slate-100 p-4 rounded-lg border border-slate-300">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">${escapeHtml(q.bankTitle || 'Markup Segments')}</div>
            <div class="space-y-2">${bankHtml}</div>
          </div>
          <div class="lg:col-span-7 bg-slate-50 p-4 rounded-lg border-2 border-slate-300 overflow-x-auto">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Answer Area</span>
              <button onclick="resetCurrentQuestion()" class="text-xs text-sky-700 hover:underline font-medium">Clear Slots</button>
            </div>
            <pre class="code-font text-xs sm:text-sm leading-7 text-slate-800 whitespace-pre-wrap">${codeHtml}</pre>
          </div>
        </div>
      `;
    }

    // ----------------------------------------------------------------------------
    // 7. RENDER DRAG & DROP SEQUENCE (Q7, Q40)
    // ----------------------------------------------------------------------------
    function renderDragSequence(q, st, container) {
      const bankHtml = q.bank.map((item, idx) => {
        const isUsed = st.values.includes(item);
        const isSel = selectedBankItem === item;
        return `
          <div draggable="true"
               ondragstart="onDragStartBank(event, ${idx})"
               onclick="selectBankTile(${idx})"
               class="drag-tile p-2.5 rounded code-font text-xs leading-relaxed font-medium whitespace-pre-wrap ${isSel ? 'selected-tile' : ''} ${isUsed ? 'opacity-50 bg-slate-100' : ''}">
            <div class="flex items-center justify-between gap-2">
              <span>${escapeHtml(item)}</span>
              ${isUsed ? '<span class="text-[10px] font-sans px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">Placed</span>' : ''}
            </div>
          </div>
        `;
      }).join('');

      const slotsHtml = q.sequenceAnswers.map((_, slotIdx) => {
        const val = st.values[slotIdx] || '';
        let statusClass = val ? 'filled' : '';
        if (examMode === 'practice' && st.checked) {
          statusClass += st.partResults[slotIdx] ? ' slot-correct' : ' slot-wrong';
        }
        return `
          <div class="flex items-center gap-2.5">
            <span class="w-6 text-right font-bold text-xs text-slate-500">${slotIdx + 1}</span>
            <div ondragover="onDragOverSlot(event)"
                 ondragleave="onDragLeaveSlot(event)"
                 ondrop="onDropOnSlot(event, ${q.id}, ${slotIdx})"
                 onclick="onClickSlot(${q.id}, ${slotIdx})"
                 class="drop-slot flex-1 rounded px-3 py-2 flex items-center justify-between cursor-pointer code-font text-xs sm:text-sm ${statusClass}">
              <span class="whitespace-pre-wrap ${val ? 'text-slate-900 font-semibold' : 'text-slate-400 font-sans italic'}">${val ? escapeHtml(val) : `Step ${slotIdx + 1} — Click or drop segment here`}</span>
              ${val ? '<span class="text-xs text-slate-400 hover:text-rose-600 ml-2">✕</span>' : ''}
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-5 bg-slate-100 p-4 rounded-lg border border-slate-300">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-700">${escapeHtml(q.bankTitle || 'Segments')}</span>
              <span class="text-[11px] text-slate-500">Click item to auto-place in next slot</span>
            </div>
            <div class="space-y-2">${bankHtml}</div>
          </div>
          <div class="lg:col-span-7 bg-white p-4 rounded-lg border-2 border-slate-300">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Answer Area (Ordered 1 to ${q.sequenceAnswers.length})</span>
              <button onclick="resetCurrentQuestion()" class="text-xs text-sky-700 hover:underline font-medium">Clear All</button>
            </div>
            <div class="space-y-2">${slotsHtml}</div>
          </div>
        </div>
      `;
    }

    // Shared Drag & Drop / Click-to-Place Handlers
    function onDragStartBank(e, bankIdx) {
      const q = getCurrentQuestion();
      const item = q.bank[bankIdx];
      selectedBankItem = item;
      e.dataTransfer.setData('text/plain', item);
    }

    function selectBankTile(bankIdx) {
      const q = getCurrentQuestion();
      const st = userState[q.id];
      const item = q.bank[bankIdx];

      // For sequence or code/match questions: if user clicks a bank tile and there is an empty slot,
      // we can either highlight it or place it in the first empty slot if double-clicked / clicked!
      // Let's make single-click immediately place into the first empty slot if nothing is selected, OR select it!
      // Even faster for spamming: clicking a bank item places it right into the first empty slot!
      const firstEmptyIdx = st.values.findIndex(v => v === '');
      if (firstEmptyIdx !== -1) {
        st.values[firstEmptyIdx] = item;
        st.checked = false;
        selectedBankItem = null;
        if (examMode === 'practice' && instantCheck && st.values.every(v => v !== '')) {
          checkCurrentAnswer();
          return;
        }
        renderCurrentQuestion();
      } else {
        selectedBankItem = (selectedBankItem === item) ? null : item;
        renderCurrentQuestion();
      }
    }

    function onDragOverSlot(e) {
      e.preventDefault();
      e.currentTarget.classList.add('drag-over');
    }

    function onDragLeaveSlot(e) {
      e.currentTarget.classList.remove('drag-over');
    }

    function onDropOnSlot(e, qId, slotIdx) {
      e.preventDefault();
      e.currentTarget.classList.remove('drag-over');
      const item = e.dataTransfer.getData('text/plain') || selectedBankItem;
      if (!item) return;
      const st = userState[qId];
      st.values[slotIdx] = item;
      st.checked = false;
      selectedBankItem = null;
      if (examMode === 'practice' && instantCheck && st.values.every(v => v !== '')) {
        checkCurrentAnswer();
      } else {
        renderCurrentQuestion();
      }
    }

    function onClickSlot(qId, slotIdx) {
      const st = userState[qId];
      if (selectedBankItem) {
        st.values[slotIdx] = selectedBankItem;
        selectedBankItem = null;
        st.checked = false;
      } else if (st.values[slotIdx]) {
        // Clear filled slot on click
        st.values[slotIdx] = '';
        st.checked = false;
      }
      renderCurrentQuestion();
    }

    // ----------------------------------------------------------------------------
    // 8. RENDER HOT AREA / CODE LINE SELECTION (Q36)
    // ----------------------------------------------------------------------------
    function renderLineSelect(q, st, container) {
      const linesHtml = q.lines.map((line, idx) => {
        const isSelected = st.value === idx;
        const isCorrectLine = q.correctLines.includes(idx);

        let lineClass = 'hover:bg-sky-50 border border-transparent';
        if (isSelected) {
          lineClass = 'bg-sky-100 border-slate-800 font-bold shadow-2xs';
        }
        if (examMode === 'practice' && st.checked) {
          if (isSelected && isCorrectLine) {
            lineClass = 'bg-emerald-100 border-emerald-700 text-emerald-950 font-bold';
          } else if (isSelected && !isCorrectLine) {
            lineClass = 'bg-rose-100 border-rose-700 text-rose-950 font-bold';
          } else if (isCorrectLine) {
            lineClass = 'bg-emerald-50 border-emerald-500 text-emerald-900';
          }
        }

        return `
          <div onclick="handleLineSelect(${q.id}, ${idx})"
               class="cursor-pointer px-3 py-0.5 rounded flex items-center gap-3 code-font text-xs sm:text-sm transition ${lineClass}">
            <span class="w-6 text-right text-slate-400 select-none text-xs">${String(idx + 1).padStart(2, '0')}</span>
            <span class="whitespace-pre">${escapeHtml(line)}</span>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="bg-slate-50 border-2 border-slate-300 rounded-lg p-4 max-w-3xl overflow-x-auto">
          <div class="space-y-0.5">${linesHtml}</div>
        </div>
      `;
    }

    function handleLineSelect(qId, lineIdx) {
      const st = userState[qId];
      st.value = lineIdx;
      st.checked = false;
      if (examMode === 'practice' && instantCheck) {
        checkCurrentAnswer();
      } else {
        renderCurrentQuestion();
      }
    }

    // ============================================================================
    // PRACTICE MODE ACTIONS (CHECK, SHOW SOLUTION, RESET, FEEDBACK)
    // ============================================================================
    function checkCurrentAnswer() {
      const q = getCurrentQuestion();
      const res = evaluateQuestion(q, true);
      if (res.allCorrect) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }
      renderCurrentQuestion();
    }

    function fillCorrectAnswer() {
      const q = getCurrentQuestion();
      const st = userState[q.id];

      if (q.type === 'dropdown-code') {
        st.values = q.dropdowns.map(d => d.answer);
      } else if (q.type === 'dropdown-qa') {
        st.values = q.items.map(item => item.answer[0]);
      } else if (q.type === 'mcq') {
        st.value = q.answer;
      } else if (q.type === 'multi-select') {
        st.values = [...q.answer];
      } else if (q.type === 'true-false') {
        st.values = q.statements.map(s => s.answer);
      } else if (q.type === 'drag-match') {
        st.values = q.targets.map(t => t.answer);
      } else if (q.type === 'drag-code') {
        st.values = [...q.slotAnswers];
      } else if (q.type === 'drag-sequence') {
        st.values = [...q.sequenceAnswers];
      } else if (q.type === 'line-select') {
        st.value = q.correctLines[0];
      }

      evaluateQuestion(q, true);
      renderCurrentQuestion();
    }

    function resetCurrentQuestion() {
      const q = getCurrentQuestion();
      const keepReview = userState[q.id]?.markedReview;
      userState[q.id] = createEmptyStateForQuestion(q);
      userState[q.id].markedReview = keepReview;
      renderCurrentQuestion();
    }

    function resetAllQuestions() {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch (e) {}
      // Remove any session-generated AI clones so it returns to the clean 40 official questions
      while (QUESTIONS.length > 40) {
        const removed = QUESTIONS.pop();
        delete userState[removed.id];
      }
      initUserState();
      document.getElementById('filterSelect').value = 'all';
      activeQuestionIds = QUESTIONS.map(q => q.id);
      currentStreak = 0;
      timerSeconds = 50 * 60;
      currentIndex = 0;
      instantCheck = true;
      const instantToggle = document.getElementById('instantCheckToggle');
      if (instantToggle) instantToggle.checked = true;
      renderCurrentQuestion();
    }

    function renderFeedbackBanner(q, st) {
      const banner = document.getElementById('feedbackBanner');
      if (examMode !== 'practice' || !st.checked) {
        banner.classList.add('hidden');
        banner.innerHTML = '';
        return;
      }

      banner.classList.remove('hidden');
      if (st.isCorrect) {
        banner.className = 'mx-4 sm:mx-6 mb-5 p-4 rounded-lg border-2 border-emerald-400 bg-emerald-50 text-emerald-950';
      } else if (st.scoreRatio > 0) {
        banner.className = 'mx-4 sm:mx-6 mb-5 p-4 rounded-lg border-2 border-amber-400 bg-amber-50 text-amber-950';
      } else {
        banner.className = 'mx-4 sm:mx-6 mb-5 p-4 rounded-lg border-2 border-rose-400 bg-rose-50 text-rose-950';
      }

      const title = st.isCorrect
        ? '✅ Spot On! 100% Correct'
        : st.scoreRatio > 0
          ? `⚠️ Partial Credit (${Math.round(st.scoreRatio * 100)}%)`
          : '❌ Not Quite Right';

      banner.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div class="font-bold text-sm sm:text-base">${title}</div>
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="openAITutorModal('explain')" class="text-xs font-bold bg-purple-700 text-white px-2.5 py-1 rounded hover:bg-purple-800 transition">
              ✨ Ask AI Why
            </button>
            <button onclick="generateAICloneQuestion()" class="text-xs font-bold bg-sky-700 text-white px-2.5 py-1 rounded hover:bg-sky-800 transition">
              ♾️ Spam Similar AI Question
            </button>
            ${!st.isCorrect ? `<button onclick="fillCorrectAnswer()" class="text-xs font-bold underline hover:opacity-80">Fill Correct Solution</button>` : ''}
            <button onclick="resetCurrentQuestion()" class="text-xs font-bold underline hover:opacity-80">Retry Blank</button>
          </div>
        </div>
        <p class="text-xs sm:text-sm leading-relaxed whitespace-pre-line">${escapeHtml(q.explanation)}</p>
      `;
    }

    // ============================================================================
    // NAVIGATION, MODES, FILTERS & SHUFFLE
    // ============================================================================
    function navigateQuestion(delta) {
      const nextIdx = currentIndex + delta;
      if (nextIdx >= 0 && nextIdx < activeQuestionIds.length) {
        currentIndex = nextIdx;
        renderCurrentQuestion();
      } else if (nextIdx >= activeQuestionIds.length) {
        openSummaryModal();
      }
    }

    function setExamMode(mode) {
      examMode = mode;
      const pBtn = document.getElementById('modePracticeBtn');
      const eBtn = document.getElementById('modeExamBtn');
      const practiceActions = document.getElementById('practiceActionButtons');
      const practiceStats = document.getElementById('practiceStatsGroup');

      if (mode === 'practice') {
        pBtn.className = 'px-2.5 py-1 rounded bg-sky-600 text-white transition';
        eBtn.className = 'px-2.5 py-1 rounded text-slate-700 hover:bg-slate-100 transition';
        practiceActions.classList.remove('hidden');
        practiceStats.classList.remove('hidden');
      } else {
        eBtn.className = 'px-2.5 py-1 rounded bg-slate-800 text-white transition';
        pBtn.className = 'px-2.5 py-1 rounded text-slate-700 hover:bg-slate-100 transition';
        practiceActions.classList.add('hidden');
        practiceStats.classList.add('hidden');
      }
      renderCurrentQuestion();
    }

    function toggleInstantCheck(checked) {
      instantCheck = checked;
      saveStateToStorage();
    }

    function toggleMarkForReview(checked) {
      const q = getCurrentQuestion();
      userState[q.id].markedReview = checked;
      updateTopStats();
      updateFilterOptionCounts();
      saveStateToStorage();
    }

    function toggleMarkForFeedback(checked) {
      const q = getCurrentQuestion();
      userState[q.id].markedFeedback = checked;
      saveStateToStorage();
    }

    function applyQuestionFilter(filterVal) {
      let filtered = QUESTIONS;
      if (filterVal === 'drag') {
        filtered = QUESTIONS.filter(q => q.type.startsWith('drag-'));
      } else if (filterVal === 'dropdown') {
        filtered = QUESTIONS.filter(q => q.type.startsWith('dropdown-'));
      } else if (filterVal === 'mcq') {
        filtered = QUESTIONS.filter(q => q.type === 'mcq' || q.type === 'multi-select');
      } else if (filterVal === 'tf') {
        filtered = QUESTIONS.filter(q => q.type === 'true-false');
      } else if (filterVal === 'line') {
        filtered = QUESTIONS.filter(q => q.type === 'line-select');
      } else if (filterVal === 'wrong') {
        filtered = QUESTIONS.filter(q => !userState[q.id].checked || !userState[q.id].isCorrect);
      } else if (filterVal === 'marked') {
        filtered = QUESTIONS.filter(q => userState[q.id].markedReview);
      }

      if (filtered.length === 0) {
        // Fallback to all if filter has 0 matches
        document.getElementById('filterSelect').value = 'all';
        activeQuestionIds = QUESTIONS.map(q => q.id);
      } else {
        activeQuestionIds = filtered.map(q => q.id);
      }
      currentIndex = 0;
      renderCurrentQuestion();
    }

    function shuffleActiveQuestions() {
      for (let i = activeQuestionIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeQuestionIds[i], activeQuestionIds[j]] = [activeQuestionIds[j], activeQuestionIds[i]];
      }
      currentIndex = 0;
      renderCurrentQuestion();
    }

    // ============================================================================
    // STATS, SUMMARY MODAL & OFFICIAL CERTIPORT SCORE REPORT
    // ============================================================================
    function updateTopStats() {
      let answeredCount = 0;
      let correctCount = 0;
      let totalScorePoints = 0;

      QUESTIONS.forEach(q => {
        if (isQuestionAnswered(q)) answeredCount++;
        const st = userState[q.id];
        if (st.checked) {
          if (st.isCorrect) correctCount++;
          totalScorePoints += st.scoreRatio;
        } else if (isQuestionAnswered(q)) {
          const evalRes = evaluateQuestion(q, false);
          totalScorePoints += evalRes.ratio;
        }
      });

      const itsScore = Math.round((totalScorePoints / QUESTIONS.length) * 1000);
      document.getElementById('statAnswered').textContent = `${answeredCount} / ${QUESTIONS.length}`;
      document.getElementById('statCorrect').textContent = `${correctCount}`;
      document.getElementById('statStreak').textContent = `${currentStreak} 🔥`;
      document.getElementById('statItsScore').textContent = `${itsScore} / 1000`;
    }

    function openSummaryModal() {
      const grid = document.getElementById('summaryGridContainer');
      grid.innerHTML = QUESTIONS.map(q => {
        const st = userState[q.id];
        const answered = isQuestionAnswered(q);
        let cardStyle = 'bg-white border-slate-300 text-slate-800';
        let statusLabel = 'Unanswered';

        if (examMode === 'practice' && st.checked) {
          if (st.isCorrect) {
            cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950';
            statusLabel = '✓ Correct';
          } else if (st.scoreRatio > 0) {
            cardStyle = 'bg-amber-50 border-amber-500 text-amber-950';
            statusLabel = `◐ ${Math.round(st.scoreRatio * 100)}%`;
          } else {
            cardStyle = 'bg-rose-50 border-rose-500 text-rose-950';
            statusLabel = '✕ Incorrect';
          }
        } else if (answered) {
          cardStyle = 'bg-sky-50 border-sky-500 text-sky-950';
          statusLabel = 'Answered';
        }

        return `
          <button onclick="jumpToQuestionId(${q.id})"
                  class="p-2.5 rounded border-2 text-left transition hover:shadow-md flex flex-col justify-between ${cardStyle}">
            <div class="flex items-center justify-between w-full">
              <span class="font-bold text-xs sm:text-sm">Q${q.id}</span>
              <span class="text-xs">${st.markedReview ? '🚩' : ''}</span>
            </div>
            <div class="text-[11px] font-semibold mt-1 truncate">${statusLabel}</div>
          </button>
        `;
      }).join('');

      const modal = document.getElementById('summaryModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeSummaryModal() {
      const modal = document.getElementById('summaryModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function jumpToQuestionId(qId) {
      let idx = activeQuestionIds.indexOf(qId);
      if (idx === -1) {
        document.getElementById('filterSelect').value = 'all';
        activeQuestionIds = QUESTIONS.map(q => q.id);
        idx = activeQuestionIds.indexOf(qId);
      }
      currentIndex = idx;
      closeSummaryModal();
      renderCurrentQuestion();
    }

    function gradeAllQuestionsNow() {
      QUESTIONS.forEach(q => evaluateQuestion(q, true));
      openSummaryModal();
      renderCurrentQuestion();
    }

    function openFinishModal() {
      openScoreReportModal();
    }

    function openScoreReportModal() {
      // Evaluate all questions so the score report reflects complete progress
      let totalRatioSum = 0;
      const sectionTotals = {};

      QUESTIONS.forEach(q => {
        const res = evaluateQuestion(q, isQuestionAnswered(q) || userState[q.id].checked);
        totalRatioSum += res.ratio;
        if (!sectionTotals[q.category]) {
          sectionTotals[q.category] = { earned: 0, count: 0 };
        }
        sectionTotals[q.category].earned += res.ratio;
        sectionTotals[q.category].count += 1;
      });

      const finalScore = Math.round((totalRatioSum / QUESTIONS.length) * 1000);
      const passed = finalScore >= 700;

      document.getElementById('reportModeLabel').textContent =
        examMode === 'exam' ? 'Exam Simulation Mode' : 'Practice / Spam Reviewer Mode';
      document.getElementById('reportYourScoreBarLabel').textContent = finalScore;
      document.getElementById('reportYourScoreBar').style.width = `${Math.min(100, Math.round(finalScore / 10))}%`;
      document.getElementById('reportYourScoreBar').className =
        `h-full transition-all duration-500 ${passed ? 'bg-emerald-600' : 'bg-amber-500'}`;

      document.getElementById('reportFinalScoreNumber').textContent = finalScore;
      document.getElementById('reportRawPoints').textContent = `${totalRatioSum.toFixed(1)} / ${QUESTIONS.length}`;

      const outcomeBox = document.getElementById('reportOutcomeBox');
      if (passed) {
        outcomeBox.className = 'p-4 flex items-center justify-between font-bold text-lg bg-emerald-50 text-emerald-800';
        outcomeBox.innerHTML = `<span>Pass</span><span class="text-2xl text-emerald-600">✔</span>`;
      } else {
        outcomeBox.className = 'p-4 flex items-center justify-between font-bold text-lg bg-rose-50 text-rose-800';
        outcomeBox.innerHTML = `<span>Needs Review (&lt;700)</span><span class="text-2xl text-rose-600">✕</span>`;
      }

      // Section Analysis Table
      const sectionOrder = [
        'HTML Fundamentals',
        'CSS Fundamentals',
        'Document Structure using HTML',
        'Multimedia Presentation using HTML',
        'Webpage Styling using CSS',
        'Accessibility, Readability, and Testing'
      ];

      document.getElementById('sectionAnalysisRows').innerHTML = sectionOrder.map((sec, idx) => {
        const data = sectionTotals[sec] || { earned: 0, count: 1 };
        const pct = Math.round((data.earned / data.count) * 100);
        return `
          <div class="flex items-center justify-between p-2.5 text-xs sm:text-sm ${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}">
            <span class="font-medium text-slate-800">${escapeHtml(sec)}</span>
            <span class="font-bold text-slate-900">${pct}%</span>
          </div>
        `;
      }).join('');

      const modal = document.getElementById('scoreReportModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      renderCurrentQuestion();
    }

    function closeScoreReportModal() {
      const modal = document.getElementById('scoreReportModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function spamMissedQuestions() {
      closeScoreReportModal();
      setExamMode('practice');
      document.getElementById('filterSelect').value = 'wrong';
      applyQuestionFilter('wrong');
    }

    // ============================================================================
    // TIMER & KEYBOARD SHORTCUTS
    // ============================================================================
    function toggleTimerPause() {
      timerPaused = !timerPaused;
      updateTimerUI();
    }

    function updateTimerUI() {
      const mins = Math.floor(timerSeconds / 60);
      const secs = timerSeconds % 60;
      const disp = document.getElementById('timerDisplay');
      disp.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}${timerPaused ? ' (PAUSED)' : ''}`;
    }

    // ============================================================================
    // GEMINI API INTEGRATION (TEXT, STRUCTURED JSON CLONES, & TTS AUDIO)
    // ============================================================================
    // Optional Gemini API key for standalone browser use. The key is stored only in this browser's
    // localStorage; it is not written into this HTML file. Do not share a browser profile that has it saved.
    const GEMINI_KEY_STORAGE = 'its_html_css_reviewer_gemini_api_key_v1';
    let apiKey = '';
    let lastAITutorText = "";
    let currentAudioPlayer = null;

    function ensureGeminiApiKey() {
      if (apiKey) return true;
      try {
        apiKey = localStorage.getItem(GEMINI_KEY_STORAGE) || '';
      } catch (e) {
        // Storage may be unavailable in some private or restricted browsing contexts.
      }
      if (apiKey) return true;

      const entered = window.prompt(
        'This AI feature needs your own Gemini API key. Enter it to continue. The key will be stored in this browser only, not in the HTML file. Do not use a key you are not authorized to use.',
        ''
      );
      if (!entered || !entered.trim()) return false;

      apiKey = entered.trim();
      try {
        localStorage.setItem(GEMINI_KEY_STORAGE, apiKey);
      } catch (e) {
        // Key remains available for the current page session even if it cannot be saved.
      }
      return true;
    }

    async function callGeminiWithBackoff(url, payload, maxRetries = 5) {
      let delay = 1000;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (response.ok) {
            return await response.json();
          }
        } catch (err) {
          // Network or transient error, wait for backoff
        }
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
        }
      }
      throw new Error('Unable to reach Gemini API after retries. Please try again.');
    }

    function formatQuestionContextForAI(q) {
      const st = userState[q.id];
      let details = `Question #${q.id} (${q.category})\nType: ${q.type}\nPrompt: ${q.prompt.replace(/<[^>]+>/g, '')}\n`;

      if (q.type === 'dropdown-code') {
        details += `Code Template:\n${q.codeTemplate}\n`;
        details += `Correct Dropdowns: ${q.dropdowns.map((d, i) => `DD${i + 1}: ${d.answer}`).join(', ')}\n`;
        details += `User Selected: ${st.values.map((v, i) => `DD${i + 1}: ${v || '(blank)'}`).join(', ')}\n`;
      } else if (q.type === 'dropdown-qa') {
        details += `Sub-questions:\n` + q.items.map((it, i) => `- ${it.question} | Correct: ${it.answer.join(' or ')} | User: ${st.values[i] || '(blank)'}`).join('\n') + `\n`;
      } else if (q.type === 'mcq' || q.type === 'multi-select') {
        details += `Options:\n` + q.options.map(o => `${o.id}: ${o.code || o.text}`).join('\n') + `\n`;
        details += `Correct Answer: ${Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}\n`;
        details += `User Selected: ${q.type === 'multi-select' ? (st.values.join(', ') || '(none)') : (st.value || '(blank)')}\n`;
      } else if (q.type === 'true-false') {
        details += `Statements:\n` + q.statements.map((s, i) => `- ${s.text} | Correct: ${s.answer} | User: ${st.values[i] || '(blank)'}`).join('\n') + `\n`;
      } else if (q.type === 'drag-match') {
        details += `Targets:\n` + q.targets.map((t, i) => `- ${t.label} -> Correct: ${t.answer} | User: ${st.values[i] || '(blank)'}`).join('\n') + `\n`;
      } else if (q.type === 'drag-code') {
        details += `Code Template:\n${q.codeTemplate}\nCorrect Slots: ${q.slotAnswers.join(' | ')}\nUser Slots: ${st.values.join(' | ')}\n`;
      } else if (q.type === 'drag-sequence') {
        details += `Correct Ordered Sequence:\n${q.sequenceAnswers.join('\n')}\nUser Sequence:\n${st.values.join('\n')}\n`;
      } else if (q.type === 'line-select') {
        details += `Code Lines:\n${q.lines.map((l, i) => `${i + 1}: ${l}`).join('\n')}\n`;
        details += `User Selected Line: ${st.value !== null ? st.value + 1 : '(none)'}\n`;
      }
      details += `Reference Explanation: ${q.explanation}`;
      return details;
    }

    function renderInlineMarkdown(line) {
      // Protect inline code spans first so inner symbols (*, _, <, >) are untouched
      const inlineTokens = [];
      let processed = line.replace(/`([^`]+)`/g, (_, codeContent) => {
        const token = `@@INLINECODE_${inlineTokens.length}@@`;
        inlineTokens.push(`<code class="inline-code">${escapeHtml(codeContent)}</code>`);
        return token;
      });

      // Escape remaining raw HTML characters (like <video>, <source>, <link>)
      processed = escapeHtml(processed);

      // Bold + Italic, Bold, Italic
      processed = processed
        .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+)__/g, '<strong>$1</strong>')
        .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,!?:;)]|$)/g, '$1<em>$2</em>');

      // Auto-badge raw escaped HTML tags like &lt;video&gt; that were not in backticks
      processed = processed.replace(/(&lt;\/?[a-zA-Z0-9-]+(?:\s+[^&]*?)?&gt;)/g, '<code class="inline-code">$1</code>');

      // Restore inline code tokens
      inlineTokens.forEach((html, idx) => {
        processed = processed.replace(`@@INLINECODE_${idx}@@`, html);
      });

      return processed;
    }

    function formatMarkdownSimple(mdText) {
      if (!mdText) return '';
      const normalized = String(mdText).replace(/\r\n/g, '\n');

      // 1. Extract fenced code blocks ```lang ... ```
      const codeBlocks = [];
      const withoutCodeBlocks = normalized.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
        const token = `@@CODEBLOCK_${codeBlocks.length}@@`;
        const cleanLang = lang ? escapeHtml(lang.toUpperCase()) : 'CODE';
        const encodedForCopy = encodeURIComponent(code.trim());
        codeBlocks.push(`
          <div class="my-2.5 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
            <div class="bg-slate-800 px-3 py-1 flex items-center justify-between text-[11px] text-slate-300 font-mono">
              <span>${cleanLang}</span>
              <button type="button" onclick="copyCodeBlock(this, '${encodedForCopy}')" class="text-sky-300 hover:text-white font-sans font-semibold">
                📋 Copy
              </button>
            </div>
            <pre class="code-block !my-0 !rounded-none !border-0">${escapeHtml(code.trim())}</pre>
          </div>
        `);
        return token;
      });

      const lines = withoutCodeBlocks.split('\n');
      let html = '';
      let inUl = false;
      let inOl = false;
      let inTable = false;
      let tableRows = [];

      function closeLists() {
        if (inUl) { html += '</ul>'; inUl = false; }
        if (inOl) { html += '</ol>'; inOl = false; }
      }

      function flushTable() {
        if (!inTable || tableRows.length === 0) return;
        let tHtml = '<table>';
        const headerCells = tableRows[0];
        tHtml += '<thead><tr>' + headerCells.map(c => `<th>${renderInlineMarkdown(c)}</th>`).join('') + '</tr></thead>';
        if (tableRows.length > 1) {
          tHtml += '<tbody>';
          for (let r = 1; r < tableRows.length; r++) {
            // Skip markdown separator row like |---|---|
            if (tableRows[r].every(cell => /^[:\-\s]+$/.test(cell))) continue;
            tHtml += '<tr>' + tableRows[r].map(c => `<td>${renderInlineMarkdown(c)}</td>`).join('') + '</tr>';
          }
          tHtml += '</tbody>';
        }
        tHtml += '</table>';
        html += tHtml;
        inTable = false;
        tableRows = [];
      }

      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();

        // Check for fenced code block placeholder
        const codeMatch = trimmed.match(/^@@CODEBLOCK_(\d+)@@$/);
        if (codeMatch) {
          closeLists();
          flushTable();
          html += codeBlocks[Number(codeMatch[1])];
          continue;
        }

        // Check for markdown table row
        if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
          closeLists();
          inTable = true;
          const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
          tableRows.push(cells);
          continue;
        } else if (inTable) {
          flushTable();
        }

        // Empty line
        if (!trimmed) {
          closeLists();
          continue;
        }

        // Horizontal rule
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
          closeLists();
          html += '<hr>';
          continue;
        }

        // Headings (#, ##, ###, ####)
        const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
        if (headingMatch) {
          closeLists();
          const level = headingMatch[1].length;
          html += `<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`;
          continue;
        }

        // Blockquote (> ...)
        const quoteMatch = trimmed.match(/^>\s?(.*)$/);
        if (quoteMatch) {
          closeLists();
          html += `<blockquote>${renderInlineMarkdown(quoteMatch[1])}</blockquote>`;
          continue;
        }

        // Unordered list (*, -, •)
        const ulMatch = trimmed.match(/^([*\-•])\s+(.*)$/);
        if (ulMatch) {
          if (inOl) { html += '</ol>'; inOl = false; }
          if (!inUl) { html += '<ul>'; inUl = true; }
          html += `<li>${renderInlineMarkdown(ulMatch[2])}</li>`;
          continue;
        }

        // Ordered list (1., 2., etc.)
        const olMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
        if (olMatch) {
          if (inUl) { html += '</ul>'; inUl = false; }
          if (!inOl) { html += '<ol>'; inOl = true; }
          html += `<li>${renderInlineMarkdown(olMatch[2])}</li>`;
          continue;
        }

        // Standard paragraph
        closeLists();
        html += `<p>${renderInlineMarkdown(trimmed)}</p>`;
      }

      closeLists();
      flushTable();

      return `<div class="ai-markdown">${html}</div>`;
    }

    function copyCodeBlock(btnEl, encodedCode) {
      try {
        const text = decodeURIComponent(encodedCode);
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        const orig = btnEl.innerHTML;
        btnEl.innerHTML = '✓ Copied!';
        setTimeout(() => { btnEl.innerHTML = orig; }, 1500);
      } catch (e) {}
    }

    function openAITutorModal(initialPreset = null) {
      const q = getCurrentQuestion();
      document.getElementById('aiTutorSubtitle').textContent =
        `Context-aware coaching for Question ${q.id} (${q.category})`;
      const modal = document.getElementById('aiTutorModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');

      if (initialPreset) {
        runAITutorPreset(initialPreset);
      }
    }

    function closeAITutorModal() {
      const modal = document.getElementById('aiTutorModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (currentAudioPlayer) {
        currentAudioPlayer.pause();
        currentAudioPlayer = null;
      }
    }

    async function runAITutorPreset(presetType) {
      const q = getCurrentQuestion();
      const context = formatQuestionContextForAI(q);
      let userTask = '';

      if (presetType === 'explain') {
        userTask = `Explain clearly why the correct answer is right for this Certiport HTML & CSS ITS exam question. If the user selected a wrong or partial answer, gently point out why their choice doesn't work and how to spot the right syntax immediately.`;
      } else if (presetType === 'mnemonic') {
        userTask = `Give me a super catchy, unforgettable memory trick, acronym, or 10-second rule of thumb so I never miss this question or any similar HTML/CSS ITS exam question when spamming practice runs.`;
      } else if (presetType === 'distractors') {
        userTask = `Break down each distractor / wrong option in this question and explain specifically why it is invalid or a trap in HTML5/CSS3.`;
      }

      await queryAITutor(userTask, context);
    }

    async function sendCustomAITutorPrompt() {
      const input = document.getElementById('aiCustomInput');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      const q = getCurrentQuestion();
      const context = formatQuestionContextForAI(q);
      await queryAITutor(text, context);
    }

    async function queryAITutor(userPrompt, questionContext) {
      const bodyEl = document.getElementById('aiTutorBody');
      if (!ensureGeminiApiKey()) {
        bodyEl.innerHTML = `<div class="p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900">AI tutoring was not started because no Gemini API key was entered. You can retry from the AI Tutor button.</div>`;
        return;
      }
      bodyEl.innerHTML = `
        <div class="p-4 rounded-lg bg-white border border-sky-200 flex items-center gap-3 text-sky-900">
          <div class="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
          <span class="font-medium">Gemini AI Tutor is analyzing Question #${getCurrentQuestion().id}...</span>
        </div>
      `;

      const systemPrompt = `You are an expert Certiport Information Technology Specialist (ITS) HTML and CSS Exam Coach helping a college student master their 40-question reviewer. Keep explanations concise, high-yield, structured with bullet points, and directly focused on passing the Certiport HTML & CSS exam.`;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{
          parts: [{
            text: `CURRENT EXAM QUESTION CONTEXT:\n${questionContext}\n\nSTUDENT REQUEST:\n${userPrompt}`
          }]
        }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      };

      try {
        const result = await callGeminiWithBackoff(apiUrl, payload);
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
        lastAITutorText = text;

        bodyEl.innerHTML = `
          <div class="p-4 rounded-lg bg-white border border-slate-300 shadow-2xs space-y-2 leading-relaxed">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-purple-800">✨ Gemini Tutor Breakdown</span>
              <button onclick="speakAITutorResponse()" class="text-xs font-semibold text-sky-700 hover:underline flex items-center gap-1">
                🔊 Read Aloud
              </button>
            </div>
            <div>${formatMarkdownSimple(text)}</div>
          </div>
        `;
      } catch (err) {
        bodyEl.innerHTML = `
          <div class="p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-800">
            <strong>Error:</strong> ${escapeHtml(err.message)}
          </div>
        `;
      }
    }

    // ----------------------------------------------------------------------------
    // AI INFINITE CLONE QUESTION GENERATOR (STRUCTURED JSON SCHEMA)
    // ----------------------------------------------------------------------------
    async function generateAICloneQuestion() {
      if (!ensureGeminiApiKey()) return;
      const sourceQ = getCurrentQuestion();
      const btn = document.getElementById('aiCloneTopBtn');
      const originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `⏳ <span>Cloning Q${sourceQ.id}...</span>`;

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

      // Map complex types to one of the 4 clean interactive schemas so it works 100% seamlessly
      let targetType = sourceQ.type;
      if (!['mcq', 'true-false', 'dropdown-code', 'drag-match'].includes(targetType)) {
        targetType = sourceQ.type.startsWith('drag-') ? 'drag-match' : 'mcq';
      }

      const promptText = `Create a brand-new, realistic Certiport ITS HTML & CSS exam question that tests the EXACT same HTML/CSS concept as this question, but uses a fresh scenario, different tag values/colors/filenames, and shuffled options so the student can test true mastery rather than memorization.

SOURCE QUESTION TO CLONE:
${formatQuestionContextForAI(sourceQ)}

REQUIRED TARGET QUESTION TYPE: "${targetType}"
Rules by targetType:
- If "mcq": Provide 4 options (ids "A", "B", "C", "D") and set mcqAnswer to the single correct letter ("A", "B", "C", or "D").
- If "true-false": Provide 3 or 4 statements in tfStatements, each with text and answer ("True" or "False").
- If "dropdown-code": Provide a codeTemplate using HTML entities (&lt; and &gt;) and placeholders {{dd0}}, {{dd1}}, etc. Provide matching dropdowns array where each item has 4 options and 1 exact answer string from those options.
- If "drag-match": Provide a bank of 4 to 5 items and 3 to 4 targets, where each target has a label description and an answer that exactly matches one string in bank.`;

      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              category: { type: "STRING" },
              prompt: { type: "STRING" },
              explanation: { type: "STRING" },
              mcqOptions: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    id: { type: "STRING" },
                    text: { type: "STRING" }
                  },
                  required: ["id", "text"]
                }
              },
              mcqAnswer: { type: "STRING" },
              tfStatements: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    text: { type: "STRING" },
                    answer: { type: "STRING" }
                  },
                  required: ["text", "answer"]
                }
              },
              codeTemplate: { type: "STRING" },
              dropdowns: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    options: { type: "ARRAY", items: { type: "STRING" } },
                    answer: { type: "STRING" }
                  },
                  required: ["options", "answer"]
                }
              },
              bank: { type: "ARRAY", items: { type: "STRING" } },
              targets: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    label: { type: "STRING" },
                    answer: { type: "STRING" }
                  },
                  required: ["label", "answer"]
                }
              }
            },
            required: ["category", "prompt", "explanation"]
          }
        }
      };

      try {
        const result = await callGeminiWithBackoff(apiUrl, payload);
        const rawJson = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = JSON.parse(rawJson);

        const newId = QUESTIONS.length + 1;
        const newQ = {
          id: newId,
          isAIClone: true,
          clonedFromId: sourceQ.isAIClone ? sourceQ.clonedFromId : sourceQ.id,
          type: targetType,
          category: sourceQ.category,
          prompt: parsed.prompt,
          explanation: parsed.explanation
        };

        if (targetType === 'mcq') {
          newQ.options = (parsed.mcqOptions && parsed.mcqOptions.length >= 2)
            ? parsed.mcqOptions
            : [
                { id: 'A', text: 'Option A' },
                { id: 'B', text: 'Option B' },
                { id: 'C', text: 'Option C' },
                { id: 'D', text: 'Option D' }
              ];
          newQ.answer = parsed.mcqAnswer || 'A';
        } else if (targetType === 'true-false') {
          newQ.statements = parsed.tfStatements || [];
        } else if (targetType === 'dropdown-code') {
          newQ.codeTemplate = parsed.codeTemplate || '';
          newQ.dropdowns = parsed.dropdowns || [];
        } else if (targetType === 'drag-match') {
          newQ.bankTitle = 'Values / Elements';
          newQ.bank = parsed.bank || [];
          newQ.targetsTitle = 'Descriptions';
          newQ.targets = parsed.targets || [];
        }

        QUESTIONS.push(newQ);
        userState[newQ.id] = createEmptyStateForQuestion(newQ);
        activeQuestionIds.push(newQ.id);
        currentIndex = activeQuestionIds.length - 1;
        renderCurrentQuestion();
      } catch (err) {
        openAITutorModal();
        document.getElementById('aiTutorBody').innerHTML = `
          <div class="p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-800">
            Could not generate AI clone question right now (${escapeHtml(err.message)}). Please try again!
          </div>
        `;
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    }

    // ----------------------------------------------------------------------------
    // AI PERSONALIZED STUDY PLAN IN THE SCORE REPORT MODAL
    // ----------------------------------------------------------------------------
    async function generateAIStudyPlan() {
      if (!ensureGeminiApiKey()) return;
      const btn = document.getElementById('aiStudyPlanBtn');
      const container = document.getElementById('aiStudyPlanContainer');
      btn.disabled = true;
      btn.textContent = '⏳ Analyzing Your Exam Performance...';

      container.innerHTML = `
        <div class="flex items-center gap-3 text-purple-900 py-2">
          <div class="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin shrink-0"></div>
          <span>Gemini AI is inspecting your section scores and missed questions to build your custom cram sheet...</span>
        </div>
      `;

      const missedSummaries = [];
      const sectionBreakdown = {};

      QUESTIONS.forEach(q => {
        const res = evaluateQuestion(q, false);
        if (!sectionBreakdown[q.category]) {
          sectionBreakdown[q.category] = { earned: 0, total: 0 };
        }
        sectionBreakdown[q.category].earned += res.ratio;
        sectionBreakdown[q.category].total += 1;

        if (res.ratio < 1 && isQuestionAnswered(q)) {
          missedSummaries.push(`Q${q.id} (${q.category}): ${q.prompt.slice(0, 110)}...`);
        }
      });

      const sectionSummaryText = Object.entries(sectionBreakdown)
        .map(([sec, d]) => `- ${sec}: ${Math.round((d.earned / d.total) * 100)}%`)
        .join('\n');

      const prompt = `Here are my current Certiport HTML & CSS ITS Practice Exam results:
Section Scores:
${sectionSummaryText}

Questions I missed or got partial credit on:
${missedSummaries.length > 0 ? missedSummaries.slice(0, 12).join('\n') : 'None answered wrong yet — give me a high-yield top 5 HTML & CSS ITS exam cheat sheet!'}

Create a concise, high-impact "Last-Minute ITS Exam Cram Sheet" with:
1. My Top 2 Priority Weak Areas based on the section scores.
2. Exact HTML5 & CSS3 syntax rules I need to memorize for the questions I missed.
3. 3 rapid-fire exam traps to watch out for on Certiport Compass.`;

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;
      try {
        const result = await callGeminiWithBackoff(apiUrl, {
          contents: [{ parts: [{ text: prompt }] }]
        });
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate study plan.';
        container.innerHTML = `<div class="bg-white p-3.5 rounded border border-purple-200 space-y-2">${formatMarkdownSimple(text)}</div>`;
      } catch (err) {
        container.innerHTML = `<div class="text-rose-700 font-medium">Error generating study plan: ${escapeHtml(err.message)}</div>`;
      } finally {
        btn.disabled = false;
        btn.textContent = '✨ Refresh AI Cram Sheet';
      }
    }

    // ----------------------------------------------------------------------------
    // GEMINI TTS AUDIO COACH (PCM16 TO WAV)
    // ----------------------------------------------------------------------------
    function base64ToArrayBuffer(base64) {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }

    function pcmToWav(pcm16, sampleRate) {
      const numChannels = 1;
      const bitsPerSample = 16;
      const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
      const blockAlign = (numChannels * bitsPerSample) / 8;
      const dataSize = pcm16.length * 2;
      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);

      function writeString(offset, str) {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
        }
      }

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitsPerSample, true);
      writeString(36, 'data');
      view.setUint32(40, dataSize, true);

      let offset = 44;
      for (let i = 0; i < pcm16.length; i++, offset += 2) {
        view.setInt16(offset, pcm16[i], true);
      }
      return new Blob([buffer], { type: 'audio/wav' });
    }

    async function speakAITutorResponse() {
      if (!ensureGeminiApiKey()) return;
      const q = getCurrentQuestion();
      const ttsBtn = document.getElementById('aiTtsBtn');
      const textToRead = (lastAITutorText || q.explanation).replace(/[*#`]/g, '').slice(0, 650);

      if (currentAudioPlayer) {
        currentAudioPlayer.pause();
        currentAudioPlayer = null;
        ttsBtn.innerHTML = `🔊 <span>Listen</span>`;
        return;
      }

      ttsBtn.disabled = true;
      ttsBtn.innerHTML = `⏳ <span>Loading Audio...</span>`;

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{
          parts: [{ text: `Say clearly and encouragingly like an exam coach: ${textToRead}` }]
        }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Puck" }
            }
          }
        },
        model: "gemini-2.5-flash-preview-tts"
      };

      try {
        const result = await callGeminiWithBackoff(apiUrl, payload);
        const part = result?.candidates?.[0]?.content?.parts?.[0];
        const audioData = part?.inlineData?.data;
        const mimeType = part?.inlineData?.mimeType || 'audio/L16;rate=24000';

        if (audioData) {
          const rateMatch = mimeType.match(/rate=(\d+)/);
          const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
          const pcmBuffer = base64ToArrayBuffer(audioData);
          const pcm16 = new Int16Array(pcmBuffer);
          const wavBlob = pcmToWav(pcm16, sampleRate);
          const audioUrl = URL.createObjectURL(wavBlob);

          currentAudioPlayer = new Audio(audioUrl);
          ttsBtn.innerHTML = `⏹️ <span>Stop</span>`;
          currentAudioPlayer.onended = () => {
            currentAudioPlayer = null;
            ttsBtn.innerHTML = `🔊 <span>Listen</span>`;
          };
          await currentAudioPlayer.play();
        }
      } catch (err) {
        ttsBtn.innerHTML = `🔊 <span>Audio Error</span>`;
      } finally {
        ttsBtn.disabled = false;
      }
    }

    setInterval(() => {
      if (!timerPaused && timerSeconds > 0) {
        timerSeconds--;
        updateTimerUI();
        // Persist the remaining exam time periodically, even when the learner is not changing answers.
        if (timerSeconds % 5 === 0) saveStateToStorage();
      }
    }, 1000);

    // Keyboard navigation for fast spamming
    window.addEventListener('keydown', (e) => {
      if (['SELECT', 'INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight') {
        navigateQuestion(1);
      } else if (e.key === 'ArrowLeft') {
        navigateQuestion(-1);
      } else if (e.key === 'Enter' && examMode === 'practice') {
        checkCurrentAnswer();
      } else if ((e.key === 'r' || e.key === 'R') && examMode === 'practice') {
        resetCurrentQuestion();
      }
    });

    // Initialize app on load
    window.onload = function () {
      const restored = loadStateFromStorage();
      if (!restored) {
        initUserState();
      }
      const instantToggle = document.getElementById('instantCheckToggle');
      if (instantToggle) instantToggle.checked = instantCheck;
      setExamMode(examMode);
      updateFilterOptionCounts();
      renderCurrentQuestion();
      updateTimerUI();
    };
