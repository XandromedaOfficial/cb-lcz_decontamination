#include "includes\multiplayer_core.inc"

//public def OnRoundStarted()
//   CreateTimer("d1",1, 0)
//end

global tokill = [64,SE_INT]
global goahead = False

def dmg(plr)
    hp = GetPlayerHealth(plr)
    if hp > 10 then
        SetPlayerFakeHealth(plr,hp-10)
        CreateTimer("dmg",1000, 0,plr)
    else 
        if GetPlayerType(plr) != 0 then
            SetPlayerType(plr,0)
            ServerMessage(GetPlayerNickname(plr)+" was killed by Decontamination Procedure")
        end
    end
end        

def Suffering()
    for x; x < 65; x++
        if GetPlayerZone(1) == 1 then
            print("step one")
        end
    end
end

def Decom()
    ServerMessage("[FACILITY] LCZ Decontamination Process has started.")
end

def DecomTimer(mins)
    ServerMessage("[FACILITY] LCZ Decontamination Process will occur in T-Minus " + mins + " minutes")
    if mins > 5 then
        CreateTimer("DecomTimer",10, 0, mins-5) //CHANGE!
    else
        CreateTimer("Decom",10, 0) //CHANGE!
    end
end

//public def OnPlayerChat(playerid, text)
    //if instr(text, "/inj", 1)
        //zone = GetPlayerZone(playerid)
        //CreateTimer("d1", 3000, 0)
        //SendMessage(playerid, "Current Zone: " + zone)
        //return 0
	//end
//end
