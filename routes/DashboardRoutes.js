import { v4 as uuid } from 'uuid';
/**
 *  All Dashboard Routes
 *
 *  Understanding name/value pairs for Dashboard routes
 *
 *  Applicable for main/root/level 1 routes
 *  icon 		: String - It's only for main menu or you can consider 1st level menu item to specify icon name.
 *
 *  Applicable for main/root/level 1 and subitems routes
 * 	id 			: Number - You can use uuid() as value to generate unique ID using uuid library, you can also assign constant unique ID for react dynamic objects.
 *  title 		: String - If menu contains childern use title to provide main menu name.
 *  badge 		: String - (Optional - Default - '') If you specify badge value it will be displayed beside the menu title or menu item.
 * 	badgecolor 	: String - (Optional - Default - 'primary' ) - Used to specify badge background color.
 *
 *  Applicable for subitems / children items routes
 *  name 		: String - If it's menu item in which you are specifiying link, use name ( don't use title for that )
 *  children	: Array - Use to specify submenu items
 *
 *  Used to segrigate menu groups
 *  grouptitle : Boolean - (Optional - Default - false ) If you want to group menu items you can use grouptitle = true,
 *  ( Use title : value to specify group title  e.g. COMPONENTS , DOCUMENTATION that we did here. )
 *
 */

export const DashboardMenu = [
  {
    id: uuid(),
    title: "Wellness & Fitness Management",
    grouptitle: true,
  },

  {
    id: uuid(),
    title: "Dashboard",
    icon: "home",
    link: "/dashboard",
  },

  {
    id: uuid(),
    title: "Mentor Management",
    icon: "award",
    link: "/mentors",
  },

  {
    id: uuid(),
    title: "PT Management",
    icon: "users",
    children: [
      {
        id: uuid(),
        link: "/trainers",
        name: "• PT's (Personal Trainers)",
      },
      {
        id: uuid(),
        link: "/trainer-requests",
        name: "• PT Requests",
      },
    ],
  },


  {
    id: uuid(),
    title: "Client Management",
    icon: "user",
    link: "/customers",
  },

   {
  id: uuid(),
  title: "Manage Sessions",
  icon: "calendar",
  children: [
    {
      id: uuid(),
      link: "/speciality",
      name: "• Speciality",
    },
    {
      id: uuid(),
      link: "/availability-slots",
      name: "• Availability Slots",
    },
    {
      id: uuid(),
      link: "/workout",   // ✅ NEW ROUTE
      name: "• Session Types",    // ✅ NEW MENU NAME
    },
  ],
},

  {
  id: uuid(),
  title: "Plans & Subscriptions",
  icon: "credit-card",   // you can change icon if needed
  link: "/billing-details",
},

  {
    id: uuid(),
    title: "Reports",
    icon: "file-text",
    link: "/reports",
  },



// {
//   id: uuid(),
//   title: "SETTINGS",
//   grouptitle: true,
// },

{
  id: uuid(),
  title: "Settings",
  icon: "settings",
  children: [
    {
      id: uuid(),
      link: "/settings/privacy",
      name: "• Privacy Policy",
    },
    {
      id: uuid(),
      link: "/settings/terms",
      name: "• Terms & Conditions",
    },
    {
      id: uuid(),
      link: "/settings/faq",
      name: "• FAQ",
    },
  ],
},
];

export default DashboardMenu;
