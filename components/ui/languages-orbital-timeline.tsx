"use client";

import { Icon } from "@iconify/react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

interface Language {
  name: string;
  percentage: number;
}

interface LanguagesOrbitalTimelineProps {
  languages: Language[];
}

// Language to icon mapping from error.md + additional web languages
const languageIconMap: Record<string, string> = {
  'JavaScript': 'logos:javascript',
  'TypeScript': 'devicon:typescript',
  'HTML': 'logos:html-5',
  'CSS': 'skill-icons:css',
  'MDX': 'simple-icons:mdx',
  'C#': 'devicon:csharp',
  'C++': 'devicon:cplusplus',
  'C': 'streamline-logos:c-language-logo-solid',
  'Go': 'skill-icons:golang',
  'Swift': 'devicon:swift',
  'Java': 'skill-icons:java-light',
  'Rust': 'skill-icons:rust',
  'Kotlin': 'material-icon-theme:kotlin',
  'PHP': 'devicon:php',
  'Dart': 'material-icon-theme:dart',
  'Julia': 'material-icon-theme:julia',
  'Ruby': 'devicon:ruby',
  'CoffeeScript': 'skill-icons:coffeescript-light',
  'Elixir': 'devicon:elixir',
  'Crystal': 'skill-icons:crystal-light',
  'Scala': 'skill-icons:scala-light',
  'Erlang': 'logos:erlang',
  'Nim': 'devicon:nim',
  'WebAssembly': 'skill-icons:webassembly',
  'Haskell': 'skill-icons:haskell-light',
  'Red': 'material-icon-theme:red',
  'Frege': 'file-icons:frege',
  'Racket': 'devicon:racket',
  'OCaml': 'skill-icons:ocaml',
  'Objective-C': 'material-icon-theme:objective-c',
  'Nix': 'material-icon-theme:nix',
  'Perl': 'skill-icons:perl',
  'PowerShell': 'skill-icons:powershell-light'
};

// Custom icon component that returns the iconify icon name
const createIconComponent = (iconName: string) => {
  const IconComponent = ({ size }: { size: number }) => (
    <Icon icon={iconName} width={size} height={size} />
  );
  IconComponent.displayName = `IconComponent-${iconName}`;
  return IconComponent;
};

export function LanguagesOrbitalTimeline({ languages }: LanguagesOrbitalTimelineProps) {
  // Transform languages into timeline data format
  const timelineData = languages.slice(0, 6).map((lang, index) => ({
    id: index + 1,
    title: lang.name,
    date: `${lang.percentage}%`,
    content: `${lang.name} represents ${lang.percentage}% of the codebase. This language contributes significantly to the project's architecture and functionality.`,
    category: "Language",
    icon: createIconComponent(languageIconMap[lang.name] || 'mdi:code-tags'),
    relatedIds: [], // Languages don't have direct relationships in this context
    status: "completed" as const, // All languages are "used" so completed
    energy: Math.round(lang.percentage * 2), // Convert percentage to energy level (0-100)
  }));

  return (
    <div className="w-full h-[300px] md:h-[500px] -m-4">
      <RadialOrbitalTimeline timelineData={timelineData} />
    </div>
  );
}