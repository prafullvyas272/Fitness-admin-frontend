// import node module libraries
import { useState } from 'react';

// import sub components
import NavbarVertical from './navbars/NavbarVertical';
import NavbarTop from './navbars/NavbarTop';
import { Row, Col } from 'react-bootstrap';

const DefaultDashboardLayout = (props) => {
	const [showMenu, setShowMenu] = useState(true);
	const ToggleMenu = () => {
		return setShowMenu(!showMenu);
	};	
	return (
		<div id="db-wrapper" className={`${showMenu ? '' : 'toggled'}`} style={{ background: '#111111' }}>
			<div className="navbar-vertical navbar">
				<NavbarVertical
					showMenu={showMenu}
					onClick={(value) => setShowMenu(value)}
				/>
			</div>
			<div id="page-content" style={{ background: '#111111' }}>
				<div className="header" style={{ background: '#111111', borderBottom: '1px solid rgba(212,160,23,0.15)' }}>
					<NavbarTop
						data={{
							showMenu: showMenu,
							SidebarToggleMenu: ToggleMenu
						}}
					/>
				</div>
				{props.children}
				<div style={{ borderTop: '1px solid rgba(212,160,23,0.15)', padding: '12px 24px', background: '#111111' }}>
					<Row>
						<Col sm={6} className='text-center text-sm-start mb-2 mb-sm-0'></Col>
						<Col sm={6} className='text-center text-sm-end'></Col>
					</Row>
				</div>
			</div>
		</div>
	);
};
export default DefaultDashboardLayout;
