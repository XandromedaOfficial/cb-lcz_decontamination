#include "includes\multiplayer_core.inc"
#include "str_util.gs"

//public def OnRoundStarted()
//   CreateTimer("d1",1, 0)
//end

def DecomTimer(mins)
    ServerMessage("[FACILITY] LCZ Decontamination Process will occur in T-Minus" + " " + mins + " " + "minutes")
    if mins > 5 then
        CreateTimer("DecomTimer",10000, 0, mins-5)
    else
        CreateTimer("Decom",10000, 0)
    end
end

def dmg()
    hp = GetPlayerHealth(1)
    SetPlayerHealth(1,hp-10)
    CreateTimer("dmg",1000, 0)
end

def Decom()
    ServerMessage("[FACILITY] LCZ Decontamination Process has started")
    dmg()
end



public def OnPlayerChat()
    CreateTimer("DecomTimer",1, 0, 15)
end


//public def OnScriptLoaded()
//    print("LCZ Decontamination Feature Mod by Xandromeda#3756 loaded!")
//end


public def OnPlayerLCZ()
    
end

//public def OnPlayerChat(playerid, text)
    //if instr(text, "/inj", 1)
      //  zone = GetPlayerZone(playerid)
        //CreateTimer("d1", 3000, 0)
        //SendMessage(playerid, "Current Zone: " + zone)
        //return 0
	//end
//end
