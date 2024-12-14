import { useState, useEffect } from "react";
import config from "../config";
import Form from "react-bootstrap/Form";
import { UserType } from "../types/user";
import { API, Storage } from "aws-amplify";
import { onError } from "../lib/errorLib";
import { useNavigate } from "react-router-dom";
import { BillingType } from "../types/billing";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Stack from "react-bootstrap/Stack";
import { BillingForm, BillingFormType } from "../components/BillingForm";
import "./Settings.css";
import LoaderButton from "../components/LoaderButton";

const stripePromise = loadStripe(config.STRIPE_KEY);

export default function Settings() {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<null | UserType>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    function loadUser() {
      return API.get("users", "/users/me", {})
    }

    async function onLoad() {
      try {
        const user = await loadUser();
        const { username, email, description, profileimg, notes } = user;

        if (profileimg) {
          user.profileimgURL = await Storage.get(profileimg);
        }

        setUsername(username);
        setEmail(email);
        setDescription(description);
        setNotes(notes);
        setUser(user);
      } catch (e) {
        onError(e);
      }
    }

    onLoad();
  }, []);

  function validateForm() {
    return email.length > 0 && username.length > 0 && description.length > 0;
  }

  function updateUser(user: UserType) {
    return API.put("users", "/users/me", {
      body: user,
    });
  }

  async function handleProfileUpdate(event: React.FocusEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    try {
      await updateUser({
        username,
        email,
        description,
      });
      alert("Profile updated successfully!")
    } catch (e) {
      onError(e);
    } finally {
      setIsLoading(false);
    }
  }

  function billUser(details: BillingType) {
    return API.post("notes", "/billing", {
      body: details,
    });
  }

  const handleFormSubmit: BillingFormType["onSubmit"] = async (
    storage,
    info
  ) => {
    if (info.error) {
      onError(info.error);
      return;
    }
  
    setIsLoading(true);
  
    try {
      await billUser({
        storage,
        source: info.token?.id,
      });
  
      alert("Your card has been charged successfully!");
      nav("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="Settings">
      <div className="text-center">
        <h2>Settings</h2>
        
        {/* Display current note balance */}
        {user && (
          <p>You have <b>{notes}</b> more notes left.</p>
        )}
      </div>

      {/* Profile Update Form */}
      <Form onSubmit={handleProfileUpdate}>
        <Stack gap={3}>
          <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control 
              size="lg"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control 
              size="lg"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              size="lg"
              as="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          <LoaderButton
            size="lg"
            type="submit"
            isLoading={isLoading}
            disabled={!validateForm()}
          >
            Update Profile
          </LoaderButton>
        </Stack>
      </Form>
      <hr />
      <Elements
        stripe={stripePromise}
        options={{
          fonts: [
            {
              cssSrc:
                "https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800",
            },
          ],
        }}
      >
        <BillingForm isLoading={isLoading} onSubmit={handleFormSubmit} />
      </Elements>
    </div>
  );}