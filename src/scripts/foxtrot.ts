// src/scripts/foxtrot.ts

const programmingLanguages = [
  "ABAP",
  "ABC",
  "ActionScript",
  "Ada",
  "Alice",
  "Apache Groovy",
  "Apex",
  "APL",
  "Assembly language",
  "AutoLISP",
  "AWK",
  "Bash",
  "bc",
  "Bourne shell",
  "C",
  "C shell",
  "C#",
  "C++",
  "Classic Visual Basic",
  "Clipper",
  "Clojure",
  "COBOL",
  "CoffeeScript",
  "Common Lisp",
  "Crystal",
  "cT",
  "D",
  "Dart",
  "Delphi",
  "Elixir",
  "Emacs Lisp",
  "Erlang",
  "Euphoria",
  "F#",
  "Forth",
  "Fortran",
  "Genie",
  "Go",
  "Hack",
  "Haskell",
  "Icon",
  "IDL",
  "Inform",
  "Io",
  "Java",
  "JavaScript",
  "Julia",
  "Korn shell",
  "Kotlin",
  "LabVIEW",
  "Ladder Logic",
  "Lisp",
  "LiveCode",
  "Logo",
  "Lua",
  "Maple",
  "MATLAB",
  "Mercury",
  "ML",
  "MQL4",
  "NATURAL",
  "NXT-G",
  "Objective-C",
  "OpenCL",
  "OpenEdge ABL",
  "Oz",
  "Perl",
  "PHP",
  "PL/I",
  "PL/SQL",
  "PostScript",
  "Prolog",
  "Python",
  "Q",
  "R",
  "Racket",
  "Red",
  "Ring",
  "RPG",
  "Ruby",
  "Rust",
  "S",
  "SAS",
  "Scala",
  "Scheme",
  "Scratch",
  "Smalltalk",
  "SPARK",
  "SQL",
  "Stata",
  "Swift",
  "Tcl",
  "Transact-SQL",
  "TypeScript",
  "Vala",
  "VB.NET",
  "VBScript",
  "Verilog",
  "VHDL",
  "Visual FoxPro",
];

const getRandomProgrammingLanguage = (): string => {
  const randomIndex = Math.floor(Math.random() * programmingLanguages.length);
  return programmingLanguages[randomIndex];
};

export const fetchFoxtrotCode = async (): Promise<{
  language: string;
  code: string;
}> => {
  const programmingLanguage = getRandomProgrammingLanguage();
  const response = await fetch("https://skippyts.doctorew.com/foxtrot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ programmingLanguage }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log("|-o-| Foxtrot Data:", data);
  const code = data.answer || "No response from Skippy.";
  // Remove the backticks and language hint (e.g., ```perl)
  const cleanedCode = code.replace(/```[a-z]*\n|```/g, "");
  console.log("|-oo-| Foxtrot Lang:", {
    language: programmingLanguage,
    code: cleanedCode,
  });

  return { language: programmingLanguage, code: cleanedCode };
};
