import React, { useState } from 'react';
import axios from 'axios';

const ContactForm = () => {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [username, setUsername] = useState(''); // New state for username
    const [password, setPassword] = useState(''); // New state for password
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/signup', { 
                username, 
                password, 
                phoneNumber // Include phone number in the request
            });
            alert('User created successfully!');
            setName('');
            setPhoneNumber('');
            setUsername(''); // Clear username input
            setPassword(''); // Clear password input
        } catch (err) {
            setError(err.response.data.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type='text' value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Username' required />
            <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' required />
            <input type='text' value={name} onChange={(e) => setName(e.target.value)} placeholder='Name' required />
            <input type='text' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder='Phone Number' required />
            <button type='submit'>Sign Up</button>
            {error && <p>{error}</p>}
        </form>
    );
};

export default ContactForm;