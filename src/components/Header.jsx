import React from "react";
import logo from "../assets/logo.svg";

const Header = ({ currentPage, navigate }) => {
  const linkClasses = "hover:text-zinc-200 cursor-pointer transition-all";
  const activeLinkClasses = "font-medium text-zinc-200";

  return (
    <header className="flex items-center mb-12 justify-between">
      <div className="flex items-center">
        <img src={logo} className="h-10" alt="LWS AI Studio Logo" />
      </div>
      <ul className="ml-4 text-sm text-zinc-400 flex gap-8">
        <li>
          <a
            onClick={() => navigate("create")}
            className={`${linkClasses} ${
              currentPage === "create" ? activeLinkClasses : ""
            }`}
          >
            Create Image
          </a>
        </li>
        <li>
          <a
            onClick={() => navigate("collections")}
            className={`${linkClasses} ${
              currentPage === "collections" ? activeLinkClasses : ""
            }`}
          >
            Collections
          </a>
        </li>
        <li>
          <a
            onClick={() => navigate("downloaded")}
            className={`${linkClasses} ${
              currentPage === "downloaded" ? activeLinkClasses : ""
            }`}
          >
            Downloaded
          </a>
        </li>
        <li>
          <a
            onClick={() => navigate("favourites")}
            className={`${linkClasses} ${
              currentPage === "favourites" ? activeLinkClasses : ""
            }`}
          >
            Favourites
          </a>
        </li>
      </ul>
    </header>
  );
};

export default Header;
