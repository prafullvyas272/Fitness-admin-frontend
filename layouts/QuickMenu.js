// import node module libraries
import { useRouter } from "next/router";
import Link from 'next/link';
import { Fragment } from 'react';
import { useMediaQuery } from 'react-responsive';
import {
    Row,
    Col,
    Image,
    Dropdown,
    ListGroup,
} from 'react-bootstrap';

// simple bar scrolling used for notification item scrolling
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

// import data files
import NotificationList from 'data/Notification';

// import hooks
import useMounted from 'hooks/useMounted';


const QuickMenu = () => {

    const hasMounted = useMounted();
    const router = useRouter();
    
    const isDesktop = useMediaQuery({
        query: '(min-width: 1224px)'
    })

    const Notifications = () => {
        return (
            <SimpleBar style={{ maxHeight: '300px' }}>
                <ListGroup variant="flush">
                    {NotificationList.map(function (item, index) {
                        return (
                            <ListGroup.Item className={index === 0 ? 'bg-light' : ''} key={index}>
                                <Row>
                                    <Col>
                                        <Link href="#" className="text-muted">
                                            <h5 className=" mb-1">{item.sender}</h5>
                                            <p className="mb-0"> {item.message}</p>
                                        </Link>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            </SimpleBar>
        );
    }

    const UserDropdown = () => (
        <ListGroup as="ul" bsPrefix='navbar-nav' className="navbar-right-wrap ms-auto d-flex nav-top-wrap">
            <Dropdown as="li" className="ms-2">
                <Dropdown.Toggle
                    as="a"
                    bsPrefix=" "
                    style={{
                        width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
                        background: "rgba(212,160,23,0.1)", border: "1px solid rgba(212,160,23,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <i className="fe fe-user" style={{ color: "#f5d76e", fontSize: 15 }}></i>
                </Dropdown.Toggle>

                <Dropdown.Menu
                    align="end"
                    style={{ background: "#1a1a1a", border: "1px solid rgba(212,160,23,0.25)", minWidth: 160, padding: "6px" }}
                >
                    <button
                        onClick={() => {
                            localStorage.removeItem("adminToken");
                            localStorage.removeItem("refreshToken");
                            router.push("/login");
                        }}
                        style={{
                            width: "100%", background: "transparent", border: "none",
                            color: "#f87171", fontSize: 13, padding: "8px 12px",
                            borderRadius: 8, cursor: "pointer", textAlign: "left",
                            display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                        <i className="fe fe-power"></i> Sign Out
                    </button>
                </Dropdown.Menu>
            </Dropdown>
        </ListGroup>
    )

    const QuickMenuDesktop = () => <UserDropdown />
    const QuickMenuMobile = () => <UserDropdown />

    return (
        <Fragment>
            { hasMounted && isDesktop ? <QuickMenuDesktop /> : <QuickMenuMobile />}
        </Fragment>
    )
}

export default QuickMenu;