#include "includes\multiplayer_core.inc"
#include "str_util.gs"

public def OnRoundStarted()
CreateTimer("d1", 900000, 0)
end

public def OnScriptLoaded()
print("LCZ Decontamination Feature Mod by Xandromeda#3756 loaded!")
end

public def d1()
    for i=1; i<=MAX_PLAYERS; ++i
    end
    SendMessage(playerid, "[FACILITY] LCZ Decontamination Process will occur in T-Minus 15 Minutes.")
    CreateTimer("d2", 300000, 0)
end

public def d2()
    for i=1; i<=MAX_PLAYERS; ++i
    end
    SendMessage(playerid, "[FACILITY] LCZ Decontamination Process will occur in T-Minus 10 Minutes.")
    CreateTimer("d3", 300000, 0)
end

public def d3()
    for i=1; i<=MAX_PLAYERS; ++i
    end
    SendMessage(playerid, "[FACILITY] LCZ Decontamination Process will occur in T-Minus 5 Minutes.")
    CreateTimer("dfinal", 300000, 0)
end

public def OnPlayerLCZ()
    


public def OnPlayerChat(playerid, text)

    if instr(text, "/inj", 1)
        zone = GetPlayerZone(playerid)
        CreateTimer("d1", 3000, 0)
        SendMessage(playerid, "Current Zone: " + zone)
        return 0
	end

end
