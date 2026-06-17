import { Navigate } from "react-router-dom";

/**
 * `/business/account` is the post-login "settings" landing target (see
 * utils/authResponse.js). The full account management UI lives on the Settings
 * page (password change, notification preferences), so this route simply
 * forwards there to avoid duplicating that screen.
 */
const BusinessAccount = () => <Navigate to="/business/settings" replace />;

export default BusinessAccount;
