// ---------------- DOM ELEMENTS ----------------
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const githubUrlInput = document.getElementById("githubUrl");
const loadingSection = document.getElementById("loading");
const resultSection = document.getElementById("result");

// ---------------- BUTTON CLICK ----------------
analyzeBtn.addEventListener("click", () => {
  const githubUrl = githubUrlInput.value.trim();

  if (!githubUrl) {
    alert("Please enter a GitHub profile URL");
    return;
  }

  const username = extractUsername(githubUrl);

  if (!username) {
    alert("Invalid GitHub profile URL");
    return;
  }

  startAnalysis(username);
});

// ---------------- EXTRACT USERNAME ----------------
function extractUsername(url) {
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.includes("github.com")) return null;

    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    return pathParts[0] || null;
  } catch {
    return null;
  }
}


// ---------------- MAIN ANALYSIS ----------------
async function startAnalysis(username) {
  loadingSection.classList.remove("hidden");
  resultSection.classList.add("hidden");

  try {
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    const userData = await userResponse.json();

    const repoResponse = await fetch(
      `https://api.github.com/users/${username}/repos`
    );
    const repoData = await repoResponse.json();

    const analysis = analyzeProfile(userData, repoData);
    renderResults(analysis);

    loadingSection.classList.add("hidden");
    resultSection.classList.remove("hidden");
  } catch (error) {
    loadingSection.classList.add("hidden");
    alert("Error fetching GitHub data");
    console.error(error);
  }
}

// ---------------- ANALYSIS LOGIC ----------------
function analyzeProfile(userData, repos) {
  let score = 0;
  let strengths = [];
  let redFlags = [];
  let recommendations = [];

  // 1. Repository //
 if (repos.length >= 5) {
  score += 10;
  strengths.push("Strong number of repositories");
} 
else {
  redFlags.push("Very limited public projects");
  recommendations.push("Build more real-world projects");
}
 
 
  // 2. Documentation Quality
  const documentedRepos = repos.filter(repo => repo.description).length;
  const docRatio = documentedRepos / repos.length || 0;

  if (docRatio >= 0.6) {
    score += 20;
  if (docRatio >= 0.8) {
    score += 20;
  strengths.push("Excellent documentation across projects");
}
else if (docRatio >= 0.5) {
    score += 5;
  strengths.push("Good documentation but can improve");
}
else {
  redFlags.push("Poor documentation coverage");
}

  } else {
    score += Math.floor(docRatio * 20);
    redFlags.push("Many repositories lack documentation");
    recommendations.push("Add clear README files and descriptions");
  }

  // 3. Recent Activity (Last 90 days)
  const activeRepos = repos.filter(repo => {
    const days =
      (Date.now() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);
    return days <= 90;
  });

   if (activeRepos.length >= 4) {
    score += 20;  
  strengths.push("Highly active GitHub profile");
    }
   else if (activeRepos.length >= 2) {
    score +=10;
  strengths.push("Moderately active profile");
   }else {
  redFlags.push("Low recent activity");
     recommendations.push("Maintain weekly or bi-weekly commits");
}

  // 4. Language Diversity
  const languages = new Set(repos.map(repo => repo.language).filter(Boolean));

  if (languages.size >= 3) {
    score += 15;
  strengths.push("Strong multi-technology expertise");
}
else if (languages.size >= 2) {
    score += 8;
  strengths.push("Good language diversity");
}
else {
  redFlags.push("Limited tech stack exposure");
    recommendations.push("Build projects using different technologies");
  }

  // 5. Project Impact
  const impactfulRepos = repos.filter(
    repo => repo.stargazers_count > 0 || repo.forks_count > 0
  );

  if (impactfulRepos.length > 0) {
    score += 15;
    strengths.push("Some projects show community engagement");
  } else {
    redFlags.push("Projects lack stars or forks");
    recommendations.push("Improve project quality and real-world relevance");
  }

  // 6. Consistency
  const accountAgeYears =
    (Date.now() - new Date(userData.created_at)) /
    (1000 * 60 * 60 * 24 * 365);

  if (repos.length / accountAgeYears >= 1) {
    score += 20;
    strengths.push("Consistent project development over time");
  } else {
    redFlags.push("Inconsistent long-term contributions");
    recommendations.push("Focus on maintaining long-term projects");
  }

  return { score, strengths, redFlags, recommendations };
}

// ---------------- UI RENDERING ----------------
function renderResults({ score, strengths, redFlags, recommendations }) {
  document.getElementById("score").innerText = `${score} / 100`;

  const strengthsList = document.getElementById("strengths");
  const redFlagsList = document.getElementById("redFlags");
  const recommendationsList = document.getElementById("recommendations");

  strengthsList.innerHTML = "";
  redFlagsList.innerHTML = "";
  recommendationsList.innerHTML = "";

  strengths.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    strengthsList.appendChild(li);
  });

  redFlags.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    redFlagsList.appendChild(li);
  });

  recommendations.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    recommendationsList.appendChild(li);
  });
  clearBtn.addEventListener("click", () => {
  githubUrlInput.value = "";

  document.getElementById("score").innerText = "-- / 100";

  document.getElementById("strengths").innerHTML = "";
  document.getElementById("redFlags").innerHTML = "";
  document.getElementById("recommendations").innerHTML = "";

  resultSection.classList.add("hidden");
  loadingSection.classList.add("hidden");
});

}
