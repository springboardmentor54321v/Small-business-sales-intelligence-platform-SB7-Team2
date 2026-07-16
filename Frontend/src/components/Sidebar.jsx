function Sidebar({
  role,
  activePage,
  setActivePage,
  setIsLoggedIn,
  roleMenus,
}) {

  return (

    <aside className="sidebar">

      <h2>MarketMind AI</h2>

      <p>{role}</p>

      <nav>

        {roleMenus[role].map((item) => (

          <a
            key={item}
            className={activePage === item ? "active" : ""}
            onClick={() => {

              if (item === "Logout") {

                setIsLoggedIn(false);

              } else {

                setActivePage(item);

              }

            }}
          >

            {item}

          </a>

        ))}

      </nav>

    </aside>

  );

}

export default Sidebar;