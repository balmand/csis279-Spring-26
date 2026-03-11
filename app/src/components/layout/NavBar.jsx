import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/clients", label: "Clients" },
  { to: "/departments", label: "Departments" },
  { to: "/orders", label: "Orders" },
];

const NavBar = () => {
  const { client, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ mr: 3 }}>
          CSIS279 App
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexGrow: 1 }}>
          {client &&
            navLinks.map((link) => (
              <Button
                key={link.to}
                color="inherit"
                component={NavLink}
                to={link.to}
                sx={{ "&.active": { textDecoration: "underline" } }}
              >
                {link.label}
              </Button>
            ))}
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {client ? (
            <>
              <Typography
                variant="body2"
                sx={{ color: "inherit", opacity: 0.85 }}
              >
                {client.client_name}
              </Typography>
              <Button color="inherit" onClick={handleSignOut}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={NavLink}
                to="/login"
                sx={{ "&.active": { textDecoration: "underline" } }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={NavLink}
                to="/register"
                sx={{ "&.active": { textDecoration: "underline" } }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
