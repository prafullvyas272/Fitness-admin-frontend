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
		<div id="db-wrapper" className={`${showMenu ? '' : 'toggled'}`} style={{ background: '#0a0a0a' }}>
			<div className="navbar-vertical navbar">
				<NavbarVertical
					showMenu={showMenu}
					onClick={(value) => setShowMenu(value)}
				/>
			</div>
			<div id="page-content" style={{ background: '#0a0a0a' }}>
				<div className="header" style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e' }}>
					<NavbarTop
						data={{
							showMenu: showMenu,
							SidebarToggleMenu: ToggleMenu
						}}
					/>
				</div>
				{props.children}
				<div style={{ borderTop: '1px solid #1e1e1e', padding: '12px 24px', background: '#0a0a0a' }}>
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
