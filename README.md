# How To Use

## 1. Install Node.js

I prefer _n_ for managing Node installs. Easiest way to get it for Linux/OS X: <https://github.com/mklement0/n-install>.

For Windows just go to <https://nodejs.org/en/> and download the installer.

I'm using the latest version of Node, LTS works too.

Once Node is installed type: <pre>node -v</pre> in your terminal/command prompt to confirm it's recognized.

## 2. Install Git

Install Git for your OS.

Linux: <https://git-scm.com/download/linux>

Windows: <https://gitforwindows.org>

Once installed, type <pre>git --version</pre> to confirm it's recognized.

## 3. Clone Repository

Navigate in your terminal/command prompt to wherever you want store the code and type <pre>git clone https://github.com/drewhershey/sneezymocks</pre> then navigate to the `sneezymocks` folder.

## 4. Change Configuration

Currently **find-skill-dam.js** is the only pre-written function. Open it in whatever text editor you want and configure the `attackerConfig` object properties to set the scenario for calculation.

All available spells/skills are listed in **data/spell-info-converted.json**.

## 5. Run Script

When configuration is properly set, type <pre>`node find-skill-damage.js`</pre> in your terminal (from within the sneezymocks folder, still) to see the results.

Example:

<pre>           Skill Name: SPELL_GUST
       Attacker Level: 50
    Actual Level Used: 1
         Target Level: 60
Damage Scaling Begins: 10
       Minimum Damage: 3
       Maximum Damage: 3
     Skill Min. Level: 1
      Skill Max Level: 1</pre>
