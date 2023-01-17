import { MarkGithubIcon } from "@primer/octicons-react";

export const ContributeLink = () => (
  <div className="absolute top-0 right-0 inline-block w-14 overflow-hidden">
    <a
      className="flex h-20 origin-top-left -rotate-45 transform items-center bg-[#0c0d0e] p-1 text-gray-300 hover:text-gray-200"
      target="_blank"
      href="https://github.com/ziin/octodevs"
      rel="noreferrer"
    >
      <MarkGithubIcon className="rotate-90 transform" size={24} />
    </a>
  </div>
);
