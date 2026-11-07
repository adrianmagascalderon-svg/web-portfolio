<?php

$site = [
    'name'          => 'Adrian M. Calderon',
    'title'         => 'Frontend Developer crafting thoughtful digital experiences.',
    'intro'         => 'I build modern, responsive, and interactive web experiences with attention to detail.',
    'available'     => true,
    'availableText' => 'Available for opportunities',
];

$projects = [
    [
        'slug'     => 'project-one',
        'name'     => 'BONE VOYAGE',
        'category' => 'GAME DEVELOPMENT',
        'status'   => 'Finished',
        'summary'  => 'A Cooperative Horror Board Game of Survival, Strategy, and Teamwork.',
        'overview' => 'Bone Voyage is a cooperative survival board game where 2–4 players explore a cursed cemetery to collect valuable treasures while avoiding monsters, traps, and supernatural threats. Players must work together, manage their resources, and escape safely within three nights while meeting their team\'s required loot quota.',
        'role'     => 'ARTIST',
        'images'   => ['images/projects/gamedev3.png', 'images/projects/gamedev2.png', 'images/projects/gamedev1.jpg' ],
    ],
    [
        'slug'     => 'project-two',
        'name'     => 'McDonald\'s Multi-Branch Network Infrastructure Design',
        'category' => 'NETWORKING',
        'status'   => 'Finished',
        'summary'  => 'A network infrastructure project connecting three McDonald\'s branches in Valenzuela using Cisco Packet Tracer',
        'overview' => 'This project focuses on designing and implementing a network infrastructure for three McDonald\'s branches located in Valenzuela City using Cisco Packet Tracer. It includes network topology planning, inter-branch connectivity, IP addressing, and network configuration to establish reliable communication between branches. The project also incorporates self-service ordering kiosks and a website to support digital services and improve overall operational efficiency.',
        'role'     => 'Network Designer & System Developer',
        'images'   => ['images/projects/net1.png', 'images/projects/net2.png', 'images/projects/net3.png'],
    ],
    [
        'slug'     => 'project-three',
        'name'     => 'TRADE HUB',
        'category' => 'WEB DEVELOPMENT',
        'status'   => 'Finished',
        'summary'  => 'An online marketplace platform that allows users to buy and sell products',
        'overview' => 'Trade Hub is an online marketplace designed to provide users with a platform where they can buy and sell products. It allows users to browse available items and manage their selling activities. The system also includes an admin side for overseeing marketplace operations and managing platform content.',
        'role'     => 'UI/UX Designer & Web Developer',
        'images'   => ['images/projects/web1.png', 'images/projects/web2.png'],

    ],
    [
        'slug'     => 'project-four',
        'name'     => 'SCHOOL BOYS',
        'category' => 'CINEMATIC SHORT FILM',
        'status'   => 'Finished',
        'summary'  => 'A creative short film featuring camera-following techniques and object-based transitions',
        'overview' => 'This short film explores creative camera techniques and visual storytelling through continuous tracking shots. The camera follows a walking character and uses surrounding objects, such as trees, to temporarily hide the character from view. As the camera moves past these objects, the character reappears with a different outfit or alongside another person, creating seamless and unexpected scene transitions.',
        'role'     => 'Camera Operator, Video Editor',
        'images'   => ['images/projects/vid1.png'],
        'video'    => 'images/projects/vid1.mp4',

    ],
    [
        'slug'     => 'project-five',
        'name'     => 'ANIME HUB',
        'category' => 'APP DEVELOPMENT',
        'status'   => 'Finished',
        'summary'  => 'A simple anime streaming app dashboard UI created in Android Studio',
        'overview' => 'AnimeHub is a beginner-level Android application project focused on designing a simple dashboard interface for an anime app using Android Studio. The project was created to become familiar with Android development tools, UI layouts, and basic application structure. It features a dashboard concept for browsing anime content, although its buttons and functionalities have not yet been implemented.',
        'role'     => 'Mobile App UI Designer',
        'images'   => ['images/projects/appdev1.png', 'images/projects/appdev2.png'],

    ],
    [
        'slug'     => 'project-six',
        'name'     => 'INTERACTIVE MOBILE QUIZ APPLICATION',
        'category' => 'APP DEVELOPMENT',
        'status'   => 'Finished',
        'summary'  => 'An interactive mobile quiz application developed using Android Studio',
        'overview' => 'QuickQuiz is an Android-based quiz application developed using Android Studio. It features a splash screen and an interactive user interface with functional buttons, allowing users to navigate and interact with the quiz. The application was also tested on an actual mobile device to ensure that its features work properly. This project demonstrates the application of basic Android development concepts, UI design, and mobile app functionality.',
        'role'     => 'Mobile Application Developer',
        'images'   => ['images/projects/quizapp1.png', 'images/projects/quizapp2.jpg', 'images/projects/quizapp3.jpg'],
    ],
];

$about = [
    'photo'      => 'images/certificates/profile.jpg', 
    'bio'        => "\n\nI am a 20-year-old third-year Bachelor of Science in Information Technology (BSIT) student at Pamantasan ng Lungsod ng Valenzuela. I am passionate about technology and continuously exploring different areas of IT, particularly web and mobile application development. Through academic projects and personal practice, I continue to develop my skills and gain experience in building digital solutions.",
    'interests'  => ['I have a strong interest in frontend development, especially in creating clean, user-friendly, and visually appealing interfaces. I enjoy turning ideas and designs into functional websites and applications while exploring different layouts, interactions, and design techniques.'],
    'philosophy' => 'I believe that good design is not only about appearance but also about usability. My goal is to create interfaces that are simple, organized, accessible, and easy to navigate while maintaining a visually pleasing experience.',
    'approach'   => 'I approach problems by understanding the situation, identifying what needs to be improved, and breaking complex tasks into smaller steps. I explore possible solutions, test different approaches, and make adjustments until I achieve the desired result. I also believe that learning from mistakes is an important part of becoming a better developer.',
];

$skills = [
    'Frontend' => ['HTML', 'CSS', 'JavaScript'],
    'Styling'  => ['CSS'],
    'Tools'    => ['Visual Studio Code', 'Android Studio', 'Git & GitHub', 'Figma', 'Cisco Packet Tracer'],
];

$learning = [
    'certificates' => [
        ['title' => 'COMPUTER SYSTEM SERVICING NCII', 'issuer' => 'TESDA', 'date' => 'MAY 03, 2024', 'description' => 'The NC II certification demonstrates skills in installing, configuring, maintaining, and repairing computer systems and networks while practicing professionalism, teamwork, and workplace safety.', 'image' => 'images/certificates/cert1.jpg'],   
        ['title' => 'GETTING STARTED WITH CISCO PACKET TRACER', 'issuer' => 'CISCO NETWORKING ACADEMY', 'date' => 'AUGUST 26, 2025', 'description' => 'Get familiar with the simulation environment.', 'image' => 'images/certificates/cert2.png'],   
        ['title' => 'EXPLORING NETWORKING WITH CISCO PACKET TRACER', 'issuer' => 'CISCO NETWORKING ACADEMY', 'date' => 'AUGUST 26, 2025', 'description' => 'Practice using Cisco Packet Tracer to set up, manage, and monitor a branch office network.', 'image' => 'images/certificates/cert3.png'],   
        ['title' => 'EXPLORING INTERNET OF THINGS WITH CISCO PACKET TRACER', 'issuer' => 'CISCO NETWORKING ACADEMY', 'date' => 'SEPTEMBER 02, 2025', 'description' => 'Learn to add and configure IoT devices in Cisco Packet Tracer to set up a smart home network.', 'image' => 'images/certificates/cert4.png'],  
        ['title' => 'INTRODUCTION TO PACKET TRACER EXAM', 'issuer' => 'CISCO NETWORKING ACADEMY', 'date' => 'SEPTEMBER 02, 2025', 'description' => 'Test knowledge on all three introductory courses and earn a digital badge.', 'image' => 'images/certificates/cert5.png'],  
    ],
];

// Walang milestones = walang Milestones tile. Idagdag lang kapag totoo.
// Hal: ['year' => '2024', 'type' => 'Education', 'title' => 'BS in ...', 'detail' => 'School name']
$milestones = [];

$contact = [
    'facebook'     => 'https://www.facebook.com/share/1DxaGA9zSB/',   
    'facebookName' => 'Adrian M. Calderon',                       
    'email'        => 'adrianmagascalderon@gmail.com',
    'phone'        => '+63 9637978093',
    'form'         => false,   
];

// Optional: dagdag na links (hal. GitHub). Walang URL = walang lalabas.
$socials = [
    ['label' => 'GitHub', 'handle' => '', 'url' => ''],
];

$puzzleData = compact('site', 'projects', 'about', 'skills', 'learning', 'milestones', 'contact', 'socials');
