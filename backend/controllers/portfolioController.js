const portfolioData = {
  name: "Andrei James",
  about: "I'm a 4th-year Information Technology student at PUP-Taguig. I love designing modern web experiences and bringing ideas to life through code.",
  photos: ['carou1.jpg', 'carou2.png', 'carou3.jpg'],
  projects: [
    { 
      title: "PUP - FESR", 
      description: "Developed the front-end of a web application managing Faculty Information, Evaluation, and Research Repository.",
      image: "/assets/images/fesr.jpg"
    },
    { 
      title: "HUEnique", 
      description: "Built an interactive color analysis web app providing personalized style recommendations.",
      image: "/assets/images/hue.jpg"
    },
    { 
      title: "Wibs Depot", 
      description: "Created the front-end for an e-commerce platform with shopping cart, profile management, and order tracking.",
      image: "/assets/images/wibs.jpg"
    },
    { 
      title: "Too Easy?", 
      description: "Developed a 2D platformer game using GDevelop, a no-code game development platform.",
      image: "/assets/images/2ez.jpg"
    }
  ],
  hobbies: [
    { icon: "fa-dumbbell", title: "Hitting the Gym", description: "Staying active and building strength is an essential part of my daily routine. I enjoy engaging in physical activities that challenge my body and keep me energized, whether it's working out, playing sports, or simply staying on the move." },
    { icon: "fa-laptop-code", title: "Learning Tech", description: "I am passionate about exploring the latest web technologies and continuously improving my development skills. I keep up with industry trends, experiment with new tools and frameworks, and refine my coding practices to stay ahead in the ever-evolving world of software development." },
    { icon: "fa-tv", title: "Watching Anime", description: "I have a deep appreciation for immersive stories, unique animation, and creative world-building, especially in anime. I love watching Attack on Titan, Chainsaw Man, and Jujutsu Kaisen, as they captivate me with their intense storytelling, stunning visuals, and well-crafted universes. Whether it's the gripping plot twists, dynamic fight scenes, or intricate character development, I enjoy experiencing narratives that transport me to different worlds and spark my imagination." },
    { icon: "fa-paint-brush", title: "UI/UX Design", description: "Designing clean, intuitive, and aesthetically pleasing user interfaces is something I take pride in. I strive to create seamless and visually appealing experiences that enhance usability and ensure a positive interaction between users and digital products." }
  ]
};

const getPortfolioData = (req, res) => {
  res.json(portfolioData);
};

const getHero = (req, res) => {
  const { name, about, photos } = portfolioData;
  res.json({ name, about, photos });
};

const getProjects = (req, res) => {
  res.json(portfolioData.projects);
};

const getHobbies = (req, res) => {
  res.json(portfolioData.hobbies);
};

module.exports = {
  getPortfolioData,
  getHero,
  getProjects,
  getHobbies
};