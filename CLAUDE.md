## gstack (REQUIRED — global install)

**Before doing ANY work, verify gstack is installed:**

```bash
test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
> ```bash
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing.
Use ~/.claude/skills/gstack/... for gstack file paths (the global path).


Y
You are working in a Next.js App Router project using:
- next-intl (i18n)
- Chakra UI
- App Router (/app/[locale])
- Component-first architecture

---

# 🚨 CORE PRINCIPLE: MOBILE-FIRST ONLY

EVERY UI MUST BE DESIGNED MOBILE-FIRST.

This is NOT optional.

---

# 1. MOBILE-FIRST RULES (STRICT)

- Default layout MUST target mobile screens first (0–768px)
- Desktop layouts are progressive enhancements
- NEVER design desktop first
- All spacing, typography, and layout must work on small screens first

---

# 2. CHAKRA UI RESPONSIVE RULE

All styling MUST use Chakra responsive syntax:

Examples:

❌ BAD:
width: "1200px"

✅ GOOD:
w={{ base: "100%", md: "600px", lg: "900px" }}

---

❌ BAD:
flexDirection: "row"

✅ GOOD:
flexDir={{ base: "column", md: "row" }}

---

# 3. COMPONENT-FIRST ARCHITECTURE (UNCHANGED)

All UI must live in:

/src/components/

Rules:
- Pages must NOT contain UI logic
- Pages only compose components
- Components must be reusable and feature-based

Example:

/src/components/login/LoginForm.tsx
/src/components/login/LoginCard.tsx

---

# 4. PAGE RULE (COMPOSITION ONLY)

All pages in:

/app/[locale]/

MUST:
- ONLY import components
- ONLY arrange layout
- NEVER contain UI logic

Example:

/app/[locale]/login/page.tsx

---

# 5. FEATURE STRUCTURE

Group components by feature:

/src/components/{feature}/

Examples:
- login
- dashboard
- stock
- teams
- users

---

# 6. NEXT-INTL RULES

- All text must use useTranslations()
- No hardcoded strings
- Default locale is Arabic (ar)
- Must support RTL for Arabic

---

# 7. MOBILE-FIRST UI REQUIREMENTS

Every component MUST:
- Fit small screens without horizontal scroll
- Use stacked layout by default
- Use full width inputs/buttons on mobile
- Use spacing tokens instead of fixed pixel spacing
- Avoid fixed width layouts

---

# 8. CHAKRA UI REQUIREMENTS

- Only Chakra UI components allowed for UI
- No raw HTML styling
- No custom CSS unless necessary
- Must use responsive props everywhere

---

# 9. PAGE CREATION WORKFLOW

When creating a new page:

STEP 1:
Build components in:
/src/components/{feature}/

STEP 2:
Compose page in:
/app/[locale]/{page}/page.tsx

STEP 3:
Add translations in:
messages/ar.json
messages/en.json

---

# 10. EXAMPLE STRUCTURE

Login feature:

/src/components/login/LoginForm.tsx
/src/components/login/LoginHeader.tsx

/app/[locale]/login/page.tsx

---

# 11. STRICT CONSTRAINTS

- No desktop-first design allowed
- No fixed widths unless mobile-safe
- No UI inside page files
- No duplication of components
- No hardcoded text

---

# 12. OUTPUT EXPECTATION

When generating code:
1. Create mobile-first components first
2. Then compose page
3. Ensure responsive Chakra props everywhere
4. Ensure RTL + i18n compatibility