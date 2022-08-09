#include "includes\multiplayer_core.inc"
#include "str_util.gs"

//public def OnRoundStarted()
//   CreateTimer("d1",1, 0)
//end

public def OnPlayerConnect()
   CreateTimer("DecomTimer",1, 0)
end

def DecomTimer()
    ServerMessage(format("[FACILITY] LCZ Decontamination Process will occur in T-Minus %d Minutes.",15))
end

public def OnScriptLoaded()
    print("LCZ Decontamination Feature Mod by Xandromeda#3756 loaded!")
end

public def d1()
    ServerMessage("[FACILITY] LCZ Decontamination Process will occur in T-Minus 15 Minutes.")
    CreateTimer("d2", 300000, 0)
end

public def d2()
    ServerMessage(playerid, "[FACILITY] LCZ Decontamination Process will occur in T-Minus 10 Minutes.")
    CreateTimer("d3", 300000, 0)
end

public def d3()
    ServerMessage(playerid, "[FACILITY] LCZ Decontamination Process will occur in T-Minus 5 Minutes.")
    CreateTimer("dfinal", 300000, 0)
end


public def OnPlayerLCZ()
    
end

public def OnPlayerChat(playerid, text)
    if instr(text, "/inj", 1)
        zone = GetPlayerZone(playerid)
        CreateTimer("d1", 3000, 0)
        SendMessage(playerid, "Current Zone: " + zone)
        return 0
	end
end
