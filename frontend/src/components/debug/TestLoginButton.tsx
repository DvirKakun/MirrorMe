// src/components/debug/TestLoginButton.tsx
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";

const TestLoginButton = () => {
  const { token, login, logout } = useAuth(); // Make sure to include login function

  // Function to generate a dummy token for testing
  const handleTestLogin = () => {
    const dummyToken = `dummy-token-${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    login(dummyToken);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white/90 rounded-md shadow p-2 flex gap-2">
      {token ? (
        <Button
          size="sm"
          variant="outline"
          onClick={logout}
          className="text-xs sm:text-sm"
        >
          התנתק (בדיקה)
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={handleTestLogin}
          className="text-xs sm:text-sm"
        >
          התחבר (בדיקה)
        </Button>
      )}
    </div>
  );
};

export default TestLoginButton;
