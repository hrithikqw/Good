import axios from 'axios';

export const USER_API_BASE_URL =
    'http://localhost:8081/api/users';

const PROFILE_IMAGES_KEY = 'profileImages';

function readProfileImages() {
    try {
        return JSON.parse(
            localStorage.getItem(PROFILE_IMAGES_KEY) || '{}'
        );
    } catch {
        return {};
    }
}

export function saveProfileImage(email, profile) {
    if (!email || !profile) {
        return;
    }

    const profileImages = readProfileImages();

    profileImages[email.trim().toLowerCase()] = profile.trim();

    localStorage.setItem(
        PROFILE_IMAGES_KEY,
        JSON.stringify(profileImages)
    );
}

export function getProfileImage(user) {
    if (!user) {
        return '';
    }

    const storedProfile = user.email
        ? readProfileImages()[
              user.email.trim().toLowerCase()
          ]
        : '';

    return (
        user.profile ||
        user.profileUrl ||
        user.profileImage ||
        user.profilePicture ||
        user.avatar ||
        user.avatarUrl ||
        user.image ||
        user.imageUrl ||
        user.photoUrl ||
        storedProfile ||
        ''
    );
}

export function getProfileFallback(user) {
    const initial =
        user?.name?.trim().charAt(0).toUpperCase() || '?';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="100%" height="100%" fill="#f0b400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="56" fill="#24313f">${initial}</text></svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export async function registerUser(user) {
    const response = await axios.post(USER_API_BASE_URL, {
        name: user.name,
        email: user.email,
        password: user.password,
        profile: user.profile,
        role: Number(user.role)
    });

    return response.data;
}

export async function getAllUsers() {
    const response = await axios.get(USER_API_BASE_URL);
    return response.data;
}

export async function getUserById(userId) {
    const response = await axios.get(
        `${USER_API_BASE_URL}/${userId}`
    );

    return response.data;
}

export async function login(email, password, role) {
    const response = await axios.post(
        `${USER_API_BASE_URL}/login`,
        {
            email,
            password,
            role: Number(role)
        }
    );

    return response.data;
}

export async function getIssuesByUserId(userId) {
    const response = await axios.get(
        `${USER_API_BASE_URL}/${userId}/issues`
    );

    return response.data;
}

export async function getIssuesByUsername(username) {
    const response = await axios.get(
        `${USER_API_BASE_URL}/username/${encodeURIComponent(
            username
        )}/issues`
    );

    return response.data;
}