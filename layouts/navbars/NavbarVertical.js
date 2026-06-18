// import node module libraries
import { Fragment, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMediaQuery } from "react-responsive";
import {
  ListGroup,
  Accordion,
  Card,
  Image,
  Badge,
  useAccordionButton,
  AccordionContext,
} from "react-bootstrap";

// import simple bar scrolling used for notification item scrolling
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

// import routes file
import { DashboardMenu } from "routes/DashboardRoutes";

const NavbarVertical = (props) => {
  const location = useRouter();
  const { collapsed = false, onToggleCollapse } = props;

  const CustomToggle = ({ children, eventKey, icon, label }) => {
    const { activeEventKey } = useContext(AccordionContext);
    const decoratedOnClick = useAccordionButton(eventKey, () =>
      console.log("totally custom!")
    );
    const isCurrentEventKey = activeEventKey === eventKey;
    return (
      <li className="nav-item">
        <Link
          href="#"
          className="nav-link "
          onClick={decoratedOnClick}
          data-bs-toggle="collapse"
          data-bs-target="#navDashboard"
          aria-expanded={isCurrentEventKey ? true : false}
          aria-controls="navDashboard"
        >
          {icon ? <i className={`nav-icon fe fe-${icon} me-2`}></i> : ""}{" "}
          {!collapsed && children}
          {collapsed && <span className="nav-tooltip">{label}</span>}
        </Link>
      </li>
    );
  };
  const CustomToggleLevel2 = ({ children, eventKey, icon }) => {
    const { activeEventKey } = useContext(AccordionContext);
    const decoratedOnClick = useAccordionButton(eventKey, () =>
      console.log("totally custom!")
    );
    const isCurrentEventKey = activeEventKey === eventKey;
    return (
      <Link
        href="#"
        className="nav-link "
        onClick={decoratedOnClick}
        data-bs-toggle="collapse"
        data-bs-target="#navDashboard"
        aria-expanded={isCurrentEventKey ? true : false}
        aria-controls="navDashboard"
      >
        {children}
      </Link>
    );
  };

  const generateLink = (item) => {
    return (
      <Link
        href={item.link}
        className={`nav-link ${
          location.pathname === item.link ? "active" : ""
        }`}
        onClick={(e) =>
          isMobile ? props.onClick(!props.showMenu) : props.showMenu
        }
      >
        {item.name}
        {""}
        {item.badge ? (
          <Badge
            className="ms-1"
            bg={item.badgecolor ? item.badgecolor : "primary"}
          >
            {item.badge}
          </Badge>
        ) : (
          ""
        )}
      </Link>
    );
  };

  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <Fragment>
      <style dangerouslySetInnerHTML={{ __html: `
        .navbar-vertical { transition: width 0.25s ease, max-width 0.25s ease, margin 0.25s ease-out; z-index: 1000; }
        .navbar-vertical.nav-collapsed { width: 68px !important; max-width: 68px !important; }
        #db-wrapper.sidebar-collapsed #page-content { margin-left: 4.25rem; }
        .navbar-vertical .nav-link { position: relative; }
        .navbar-vertical .nav-link.active::before { display: none; }
        .navbar-vertical .navbar-brand {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 24px;
          box-sizing: border-box;
        }
        .navbar-vertical.nav-collapsed .nav-link[data-bs-toggle="collapse"]::after {
          display: none !important;
        }
        .navbar-vertical .navbar-nav .nav .nav-item .nav-link {
          padding-left: 38px !important;
          font-weight: 400 !important;
        }
        .navbar-vertical .navbar-nav .nav .nav-item .nav-link.active {
          font-weight: 400 !important;
        }
        .navbar-vertical .navbar-heading {
          font-size: 9px !important;
          letter-spacing: 0.5px !important;
          white-space: nowrap !important;
        }
        .navbar-vertical.nav-collapsed .navbar-brand { padding: 0 8px; justify-content: center; }
        .navbar-vertical.nav-collapsed .nav-link { justify-content: center; padding: 0.6rem 0; }
        .navbar-vertical.nav-collapsed .nav-icon.me-2 { margin-right: 0 !important; }
        .navbar-vertical.nav-collapsed .simplebar-content-wrapper,
        .navbar-vertical.nav-collapsed .simplebar-mask { overflow: visible !important; }
        .navbar-vertical .nav-collapse-toggle {
          position: absolute;
          right: -14px;
          top: 72px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #1a1a1a;
          border: 1px solid rgba(248,227,150,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1100;
          color: #f8e396;
          padding: 0;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .navbar-vertical .nav-collapse-toggle:hover { background: #f8e396; border-color: #f8e396; color: #000; }
        .navbar-vertical .nav-tooltip {
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 12px;
          background: #1a1a1a;
          color: #fff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(0,0,0,0.45);
          border: 1px solid rgba(248,227,150,0.25);
          z-index: 1000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease;
        }
        .navbar-vertical .nav-link:hover .nav-tooltip { opacity: 1; }
        .navbar-vertical.nav-collapsed .navbar-brand img {
          width: 30px !important;
          height: 30px !important;
          object-fit: contain !important;
        }
      ` }} />

      {/* COLLAPSE TOGGLE */}
      <button
        type="button"
        className="nav-collapse-toggle"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {collapsed ? <polyline points="9 6 15 12 9 18" /> : <polyline points="15 6 9 12 15 18" />}
        </svg>
      </button>

      {/* LOGO */}
      <Link href="/dashboard" className="navbar-brand custom-brand">
        <img
          src="https://res.cloudinary.com/dbazlbkfj/image/upload/v1771390209/Layer_x0020_1_p5f6fs.png"
          className="logo-text"
          alt="logo text"
        />
      </Link>
      <SimpleBar style={{ maxHeight: "100vh" }}>
        {/* Dashboard Menu */}
        <Accordion
          defaultActiveKey="0"
          as="ul"
          className="navbar-nav flex-column"
        >
          {DashboardMenu.map(function (menu, index) {
            if (menu.grouptitle) {
              if (collapsed) return null;
              return (
                <Card bsPrefix="nav-item" key={index}>
                  {/* group title item */}
                  <div className="navbar-heading">{menu.title}</div>
                  {/* end of group title item */}
                </Card>
              );
            } else {
              if (menu.children) {
                return (
                  <Fragment key={index}>
                    {/* main menu / root menu level / root items */}
                    <CustomToggle eventKey={index} icon={menu.icon} label={menu.title}>
                      {menu.title}
                      {menu.badge ? (
                        <Badge
                          className="ms-1"
                          bg={menu.badgecolor ? menu.badgecolor : "primary"}
                        >
                          {menu.badge}
                        </Badge>
                      ) : (
                        ""
                      )}
                    </CustomToggle>
                    {!collapsed && (
                    <Accordion.Collapse
                      eventKey={index}
                      as="li"
                      bsPrefix="nav-item"
                    >
                      <ListGroup
                        as="ul"
                        bsPrefix=""
                        className="nav flex-column"
                      >
                        {menu.children.map(function (
                          menuLevel1Item,
                          menuLevel1Index
                        ) {
                          if (menuLevel1Item.children) {
                            return (
                              <ListGroup.Item
                                as="li"
                                bsPrefix="nav-item"
                                key={menuLevel1Index}
                              >
                                {/* first level menu started  */}
                                <Accordion
                                  defaultActiveKey="0"
                                  className="navbar-nav flex-column"
                                >
                                  <CustomToggleLevel2 eventKey={0}>
                                    {menuLevel1Item.title}
                                    {menuLevel1Item.badge ? (
                                      <Badge
                                        className="ms-1"
                                        bg={
                                          menuLevel1Item.badgecolor
                                            ? menuLevel1Item.badgecolor
                                            : "primary"
                                        }
                                      >
                                        {menuLevel1Item.badge}
                                      </Badge>
                                    ) : (
                                      ""
                                    )}
                                  </CustomToggleLevel2>
                                  <Accordion.Collapse
                                    eventKey={0}
                                    bsPrefix="nav-item"
                                  >
                                    <ListGroup
                                      as="ul"
                                      bsPrefix=""
                                      className="nav flex-column"
                                    >
                                      {/* second level menu started  */}
                                      {menuLevel1Item.children.map(function (
                                        menuLevel2Item,
                                        menuLevel2Index
                                      ) {
                                        if (menuLevel2Item.children) {
                                          return (
                                            <ListGroup.Item
                                              as="li"
                                              bsPrefix="nav-item"
                                              key={menuLevel2Index}
                                            >
                                              {/* second level accordion menu started  */}
                                              <Accordion
                                                defaultActiveKey="0"
                                                className="navbar-nav flex-column"
                                              >
                                                <CustomToggleLevel2
                                                  eventKey={0}
                                                >
                                                  {menuLevel2Item.title}
                                                  {menuLevel2Item.badge ? (
                                                    <Badge
                                                      className="ms-1"
                                                      bg={
                                                        menuLevel2Item.badgecolor
                                                          ? menuLevel2Item.badgecolor
                                                          : "primary"
                                                      }
                                                    >
                                                      {menuLevel2Item.badge}
                                                    </Badge>
                                                  ) : (
                                                    ""
                                                  )}
                                                </CustomToggleLevel2>
                                                <Accordion.Collapse
                                                  eventKey={0}
                                                  bsPrefix="nav-item"
                                                >
                                                  <ListGroup
                                                    as="ul"
                                                    bsPrefix=""
                                                    className="nav flex-column"
                                                  >
                                                    {/* third level menu started  */}
                                                    {menuLevel2Item.children.map(
                                                      function (
                                                        menuLevel3Item,
                                                        menuLevel3Index
                                                      ) {
                                                        return (
                                                          <ListGroup.Item
                                                            key={
                                                              menuLevel3Index
                                                            }
                                                            as="li"
                                                            bsPrefix="nav-item"
                                                          >
                                                            {generateLink(
                                                              menuLevel3Item
                                                            )}
                                                          </ListGroup.Item>
                                                        );
                                                      }
                                                    )}
                                                    {/* end of third level menu  */}
                                                  </ListGroup>
                                                </Accordion.Collapse>
                                              </Accordion>
                                              {/* end of second level accordion */}
                                            </ListGroup.Item>
                                          );
                                        } else {
                                          return (
                                            <ListGroup.Item
                                              key={menuLevel2Index}
                                              as="li"
                                              bsPrefix="nav-item"
                                            >
                                              {generateLink(menuLevel2Item)}
                                            </ListGroup.Item>
                                          );
                                        }
                                      })}
                                      {/* end of second level menu  */}
                                    </ListGroup>
                                  </Accordion.Collapse>
                                </Accordion>
                                {/* end of first level menu */}
                              </ListGroup.Item>
                            );
                          } else {
                            return (
                              <ListGroup.Item
                                as="li"
                                bsPrefix="nav-item"
                                key={menuLevel1Index}
                              >
                                {/* first level menu items */}
                                {generateLink(menuLevel1Item)}
                                {/* end of first level menu items */}
                              </ListGroup.Item>
                            );
                          }
                        })}
                      </ListGroup>
                    </Accordion.Collapse>
                    )}
                    {/* end of main menu / menu level 1 / root items */}
                  </Fragment>
                );
              } else {
                return (
                  <Card bsPrefix="nav-item" key={index}>
                    {/* menu item without any childern items like Documentation and Changelog items*/}
                    <Link
                      href={menu.link}
                      className={`nav-link ${
                        location.pathname === menu.link ? "active" : ""
                      }`}
                    >
                      {typeof menu.icon === "string" ? (
                        <i className={`nav-icon fe fe-${menu.icon} me-2`}></i>
                      ) : (
                        menu.icon
                      )}
                      {!collapsed && menu.title}
                      {!collapsed && menu.badge ? (
                        <Badge
                          className="ms-1"
                          bg={menu.badgecolor ? menu.badgecolor : "primary"}
                        >
                          {menu.badge}
                        </Badge>
                      ) : (
                        ""
                      )}
                      {collapsed && <span className="nav-tooltip">{menu.title}</span>}
                    </Link>
                    {/* end of menu item without any childern items */}
                  </Card>
                );
              }
            }
          })}
        </Accordion>
        {/* end of Dashboard Menu */}
      </SimpleBar>
    </Fragment>
  );
};

export default NavbarVertical;
