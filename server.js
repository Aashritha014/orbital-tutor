
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

// ==================================================
// CHEMISTRY KNOWLEDGE BASE
// ==================================================

const knowledgeBase = [
  {
    keywords: ["chromium", "cr exception", "cr 24"],
    answer: `Chromium (Cr, atomic number 24) has the electronic configuration [Ar] 3d5 4s1 instead of [Ar] 3d4 4s2.

This happens because a half-filled 3d subshell provides additional stability. One electron from 4s occupies 3d, resulting in a more stable arrangement.

Remember: Chromium is a common exception to the Aufbau filling order.`
  },
  {
    keywords: ["copper", "cu exception", "cu 29"],
    answer: `Copper (Cu, atomic number 29) has the configuration [Ar] 3d10 4s1 instead of [Ar] 3d9 4s2.

A completely filled d subshell provides additional stability. Therefore, one 4s electron shifts into the 3d subshell.

Copper is another important electronic configuration exception.`
  },
  {
    keywords: ["aufbau", "filling order", "orbital filling"],
    answer: `The Aufbau Principle states that electrons occupy orbitals in order of increasing energy.

The general filling order begins:

1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p → 5s → 4d → 5p → 6s.

Electrons fill lower-energy orbitals before occupying higher-energy orbitals.

Example: Sodium (Na) = 1s2 2s2 2p6 3s1.`
  },
  {
    keywords: ["pauli", "exclusion principle"],
    answer: `Pauli's Exclusion Principle states that no two electrons in an atom can have the same set of all four quantum numbers.

Important points:

• An orbital can contain a maximum of two electrons.
• These two electrons must have opposite spins.
• Their spin quantum numbers are +1/2 and -1/2.

Example: The two electrons in a 1s orbital must have opposite spins.`
  },
  {
    keywords: ["hund", "maximum multiplicity"],
    answer: `Hund's Rule states that electrons occupy degenerate orbitals individually with parallel spins before pairing occurs.

Example: For a 2p3 configuration:

2p: ↑  ↑  ↑

Each of the three p orbitals receives one electron before any pairing begins.

This arrangement reduces electron-electron repulsion and provides greater stability.`
  },
  {
    keywords: ["quantum number", "four quantum"],
    answer: `There are four quantum numbers:

1. Principal quantum number (n): Represents the main energy level.
2. Azimuthal quantum number (l): Determines the subshell and orbital shape.
3. Magnetic quantum number (ml): Determines orbital orientation.
4. Spin quantum number (ms): Represents electron spin (+1/2 or -1/2).

Together, these four numbers describe the state of an electron in an atom.`
  },
  {
    keywords: ["principal quantum"],
    answer: `The principal quantum number (n) indicates the main energy level or shell occupied by an electron.

Possible values: n = 1, 2, 3, 4...

It determines the approximate energy and size of the orbital.

Maximum electrons in a shell = 2n².

Example: For n = 2, maximum electrons = 2(2²) = 8.`
  },
  {
    keywords: ["azimuthal", "angular quantum"],
    answer: `The azimuthal quantum number (l) determines the subshell and shape of an orbital.

Values depend on n:

l = 0 → s subshell
l = 1 → p subshell
l = 2 → d subshell
l = 3 → f subshell

For a given shell, l ranges from 0 to n-1.`
  },
  {
    keywords: ["magnetic quantum"],
    answer: `The magnetic quantum number (ml) describes the orientation of an orbital in space.

Its values range from -l to +l, including zero.

Examples:

s: 1 orbital
p: 3 orbitals
d: 5 orbitals
f: 7 orbitals`
  },
  {
    keywords: ["spin quantum"],
    answer: `The spin quantum number (ms) describes the intrinsic spin of an electron.

It has two possible values:

+1/2 → Spin up (↑)
-1/2 → Spin down (↓)

Two electrons occupying the same orbital must have opposite spins.`
  },
  {
    keywords: ["s orbital", "s subshell"],
    answer: `The s orbital is spherical in shape.

Properties:
• Number of orbitals: 1
• Maximum electrons: 2
• Azimuthal quantum number: l = 0
• Magnetic quantum number: ml = 0

Every principal energy level contains an s subshell.`
  },
  {
    keywords: ["p orbital", "p subshell"],
    answer: `The p subshell contains three dumbbell-shaped orbitals:

px, py and pz.

Properties:
• Number of orbitals: 3
• Maximum electrons: 6
• Azimuthal quantum number: l = 1
• Magnetic quantum numbers: -1, 0, +1`
  },
  {
    keywords: ["d orbital", "d subshell"],
    answer: `The d subshell contains five orbitals.

Properties:
• Number of orbitals: 5
• Maximum electrons: 10
• Azimuthal quantum number: l = 2

Most d orbitals have four-lobed shapes. The dz2 orbital has a different shape with two lobes and a central ring.`
  },
  {
    keywords: ["f orbital", "f subshell"],
    answer: `The f subshell contains seven orbitals.

Properties:
• Number of orbitals: 7
• Maximum electrons: 14
• Azimuthal quantum number: l = 3

f orbitals generally have more complex shapes than s, p and d orbitals.`
  },
  {
    keywords: ["orbital capacity", "maximum electrons", "subshell capacity"],
    answer: `The maximum electron capacities are:

s = 2 electrons
p = 6 electrons
d = 10 electrons
f = 14 electrons

Remember the formula:

Maximum electrons in a subshell = 2(2l + 1).

Here, l is the azimuthal quantum number.`
  },
  {
    keywords: ["iron", "fe3+", "fe 3+", "iron 3"],
    answer: `Iron (Fe) has atomic number 26.

Neutral iron:
[Ar] 3d6 4s2

Fe3+ configuration:
[Ar] 3d5

When transition metals form positive ions, electrons are removed from the 4s orbital before the 3d orbital.

Fe3+ loses two 4s electrons and one 3d electron.`
  },
  {
    keywords: ["fe2+", "fe 2+", "iron 2"],
    answer: `Iron (Fe) has atomic number 26.

Neutral configuration:
[Ar] 3d6 4s2

Fe2+ configuration:
[Ar] 3d6

Two electrons are removed from the 4s orbital first when forming the Fe2+ ion.`
  },
  {
    keywords: ["electronic configuration", "electron configuration"],
    answer: `Electronic configuration describes how electrons are distributed among the shells, subshells and orbitals of an atom.

The filling order follows the Aufbau Principle, while electron arrangement also follows Pauli's Exclusion Principle and Hund's Rule.

Example: Oxygen (atomic number 8):

1s2 2s2 2p4

Total electrons = 8.`
  },
  {
    keywords: ["periodic table", "118 elements", "elements"],
    answer: `The modern periodic table contains 118 confirmed elements.

Elements are arranged according to increasing atomic number.

It consists of:
• 7 periods (horizontal rows)
• 18 groups (vertical columns)
• s, p, d and f blocks

Elements in the same group generally have similar valence electron configurations and chemical properties.`
  },
  {
    keywords: ["electron", "proton", "neutron", "atomic structure"],
    answer: `An atom consists of three main subatomic particles:

1. Protons: Positively charged particles in the nucleus.
2. Neutrons: Neutral particles in the nucleus.
3. Electrons: Negatively charged particles surrounding the nucleus.

The atomic number equals the number of protons.

In a neutral atom, the number of electrons equals the number of protons.`
  },
  {
    keywords: ["hello", "hi", "hey", "good morning"],
    answer: `Hello! Welcome to ChemAI Tutor.

I'm your chemistry learning assistant. You can ask me about:

• Atomic orbitals
• Electronic configurations
• Quantum numbers
• Aufbau, Pauli and Hund rules
• Configuration exceptions
• Periodic table concepts

What would you like to learn today?`
  },
  {
    keywords: ["thank you", "thanks"],
    answer: `You're welcome! Keep exploring and practising chemistry.

Remember: Understanding the concepts is more important than memorising the answers. Happy learning!`
  }
];

// ==================================================
// QUESTION MATCHING ENGINE
// ==================================================

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findAnswer(question) {
  const normalizedQuestion = normalize(question);

  let bestMatch = null;
  let bestScore = 0;

  for (const item of knowledgeBase) {
    let score = 0;

    for (const keyword of item.keywords) {
      const normalizedKeyword = normalize(keyword);

      if (normalizedQuestion.includes(normalizedKeyword)) {
        score += normalizedKeyword.includes(" ")
          ? 4
          : 2;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && bestScore >= 2) {
    return bestMatch.answer;
  }

  return `That's an interesting chemistry question!

I currently have predefined explanations for electronic configuration, atomic orbitals, quantum numbers, Aufbau, Pauli, Hund's Rule, Chromium, Copper and other atomic structure topics.

Try asking a question such as:

• Why is Chromium an exception?
• Explain Hund's Rule.
• What are the four quantum numbers?
• What is the electronic configuration of Fe3+?

I'm continuously expanding my chemistry knowledge base!`;
}

// ==================================================
// RATE LIMITING
// ==================================================

const hits = new Map();

function limited(ip) {
  const now = Date.now();

  const recent = (hits.get(ip) || [])
    .filter(time => now - time < 60000);

  recent.push(now);
  hits.set(ip, recent);

  return recent.length > 20;
}

// ==================================================
// CHAT ENDPOINT
// ==================================================

app.post("/api/chat", (req, res) => {
  if (limited(req.ip)) {
    return res.status(429).json({
      error: "Too many requests. Please wait a minute."
    });
  }

  const messages = Array.isArray(req.body.messages)
    ? req.body.messages
    : [];

  const lastMessage = [...messages]
    .reverse()
    .find(message =>
      message &&
      message.role === "user" &&
      typeof message.content === "string"
    );

  if (!lastMessage || !lastMessage.content.trim()) {
    return res.status(400).json({
      error: "Please enter a chemistry question."
    });
  }

  const reply = findAnswer(
    lastMessage.content.slice(0, 1000)
  );

  return res.json({ reply });
});

// ==================================================
// HEALTH CHECK
// ==================================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "running",
    application: "ChemAI Tutor",
    provider: "predefined-knowledge-base",
    totalTopics: knowledgeBase.length
  });
});

// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log("----------------------------------");
  console.log("       ChemAI Tutor");
  console.log("----------------------------------");
  console.log(`Server running on port ${PORT}`);
  console.log("AI Mode: Predefined Knowledge Base");
  console.log(`Knowledge entries: ${knowledgeBase.length}`);
  console.log("----------------------------------");
});
