import React, { useState } from "react";

// Mock user data
const MOCK_USER = {
  id: 1,
  name: "Jane Smith",
  email: "jane.smith@example.com",
  phone: "+1 (555) 123-4567",
  position: "Frontend Developer",
  department: "Engineering",
  joinDate: "2022-03-15",
  manager: "John Manager",
  avatar: "https://randomuser.me/api/portraits/women/4.jpg",
  bio: "Experienced frontend developer with a passion for creating intuitive user interfaces and responsive web applications.",
  skills: [
    "React",
    "TypeScript",
    "TailwindCSS",
    "JavaScript",
    "HTML/CSS",
    "Git",
  ],
  education: [
    {
      id: 1,
      institution: "University of Technology",
      degree: "Bachelor of Science in Computer Science",
      year: "2018-2022",
    },
  ],
  certifications: [
    {
      id: 1,
      name: "React Developer Certification",
      issuer: "React Training",
      year: "2022",
    },
    {
      id: 2,
      name: "Advanced JavaScript",
      issuer: "Udemy",
      year: "2021",
    },
  ],
  socialLinks: {
    linkedin: "https://linkedin.com/in/janesmith",
    github: "https://github.com/janesmith",
    website: "https://janesmith.dev",
  },
};

const Profile = () => {
  const [user, setUser] = useState(MOCK_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(MOCK_USER);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setUser(editedUser);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedUser({
      ...editedUser,
      [name]: value,
    });
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim());
    setEditedUser({
      ...editedUser,
      skills,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <button
          onClick={handleEditToggle}
          className={`px-4 py-2 rounded-md ${
            isEditing
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-indigo-600 text-white">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="mb-4 sm:mb-0 sm:mr-6">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-white"
              />
            </div>
            <div className="text-center sm:text-left">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedUser.name}
                  onChange={handleInputChange}
                  className="text-2xl font-bold bg-indigo-500 bg-opacity-50 text-white rounded px-2 py-1 mb-1 w-full"
                />
              ) : (
                <h2 className="text-2xl font-bold">{user.name}</h2>
              )}
              <p className="text-indigo-100">
                {isEditing ? (
                  <input
                    type="text"
                    name="position"
                    value={editedUser.position}
                    onChange={handleInputChange}
                    className="bg-indigo-500 bg-opacity-50 text-white rounded px-2 py-1 w-full"
                  />
                ) : (
                  user.position
                )}
                {!isEditing && <span> • {user.department}</span>}
              </p>
              {isEditing && (
                <input
                  type="text"
                  name="department"
                  value={editedUser.department}
                  onChange={handleInputChange}
                  className="bg-indigo-500 bg-opacity-50 text-white rounded px-2 py-1 mt-1 w-full"
                  placeholder="Department"
                />
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedUser.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-700">{user.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editedUser.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-700">{user.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Join Date
                  </label>
                  <p className="text-gray-700">
                    {new Date(user.joinDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Manager
                  </label>
                  <p className="text-gray-700">{user.manager}</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4">
                Social Profiles
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    LinkedIn
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="linkedin"
                      value={editedUser.socialLinks.linkedin}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          socialLinks: {
                            ...editedUser.socialLinks,
                            linkedin: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <a
                      href={user.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      {user.socialLinks.linkedin}
                    </a>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    GitHub
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="github"
                      value={editedUser.socialLinks.github}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          socialLinks: {
                            ...editedUser.socialLinks,
                            github: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <a
                      href={user.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      {user.socialLinks.github}
                    </a>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={editedUser.socialLinks.website}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          socialLinks: {
                            ...editedUser.socialLinks,
                            website: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <a
                      href={user.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      {user.socialLinks.website}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bio, Skills, Education, Certifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Bio</h3>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editedUser.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-6"
                ></textarea>
              ) : (
                <p className="text-gray-700 mb-6">{user.bio}</p>
              )}

              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Skills
              </h3>
              {isEditing ? (
                <div className="mb-6">
                  <input
                    type="text"
                    value={editedUser.skills.join(", ")}
                    onChange={handleSkillChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Separate skills with commas"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap mb-6 gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Education
              </h3>
              <div className="space-y-4 mb-6">
                {user.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="border-l-2 border-indigo-500 pl-3 py-1"
                  >
                    <p className="font-medium text-gray-900">{edu.degree}</p>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    <p className="text-xs text-gray-500">{edu.year}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Certifications
              </h3>
              <div className="space-y-4">
                {user.certifications.map((cert) => (
                  <div key={cert.id} className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">{cert.name}</p>
                    <p className="text-sm text-gray-600">
                      {cert.issuer} • {cert.year}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
