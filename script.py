import re
import os

filepath = r'c:\Users\ASUMAN\Desktop\web game\js\app.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. handleGameLaunch
old_func = "function handleGameLaunch(game) {"
new_func = """function handleGameLaunch(game) {
        window.CURRENT_ACTIVE_GAME_ID = game.id;
        if(window.achievementsData) {
             window.achievementsData.completeTask(1);
        }"""
content = content.replace(old_func, new_func)

# 2. Score recording and achievements saving
old_prog = "ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);"
new_prog = """ach.userStats.progressPercentage = Math.round((done / ach.dailyTasks.length) * 100);
        if (typeof scoreAwarded !== 'undefined' && window.CURRENT_ACTIVE_GAME_ID) {
            if(window.recordGameScore) window.recordGameScore(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
            if(window.achievementsData && window.achievementsData.addScoreToGame) window.achievementsData.addScoreToGame(window.CURRENT_ACTIVE_GAME_ID, scoreAwarded);
        }
        if(window.achievementsData && window.achievementsData.saveAchievements) window.achievementsData.saveAchievements();"""
content = content.replace(old_prog, new_prog)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Modified app.js via Python successfully!")
