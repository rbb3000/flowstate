#!/bin/bash

# Get the current state of Do Not Disturb
state=$(defaults -currentHost read ~/Library/Preferences/ByHost/com.apple.notificationcenterui doNotDisturb)

# Toggle the state
if [ "$state" -eq 0 ]; then
    # Turn on Do Not Disturb
    defaults -currentHost write ~/Library/Preferences/ByHost/com.apple.notificationcenterui doNotDisturb -boolean true
    defaults -currentHost write ~/Library/Preferences/ByHost/com.apple.notificationcenterui doNotDisturbDate -date "$(date)"
    echo "Do Not Disturb turned on"
else
    # Turn off Do Not Disturb
    defaults -currentHost write ~/Library/Preferences/ByHost/com.apple.notificationcenterui doNotDisturb -boolean false
    defaults -currentHost delete ~/Library/Preferences/ByHost/com.apple.notificationcenterui doNotDisturbDate
    echo "Do Not Disturb turned off"
fi

# Refresh the Notification Center
killall NotificationCenter