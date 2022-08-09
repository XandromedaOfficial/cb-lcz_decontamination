#include "includes\multiplayer_core.inc"
#include "str_util.gs"

//public def OnRoundStarted()
//   CreateTimer("d1",1, 0)
//end

global tokill = False

def DecomTimer(mins)
    ServerMessage("[FACILITY] LCZ Decontamination Process will occur in T-Minus" + " " + mins + " " + "minutes")
    if mins > 5 then
        CreateTimer("DecomTimer",10, 0, mins-5) //CHANGE!
    else
        CreateTimer("Decom",10, 0) //CHANGE!
    end
end

def dmg(plr)
    if GetPlayerZone(plr) != 1 then
        return
    end
    hp = GetPlayerHealth(plr)
    if hp > 10 then
        SetPlayerFakeHealth(plr,hp-10)
        CreateTimer("dmg",1000, 0,plr)
    else
        SetPlayerType(plr,0)
        ServerMessage(GetPlayerNickname(plr)+" was killed by Decontamination Procedure")
    end
end        

def StartSuffering()
    for x; x < 65; x++
        role = GetPlayerType(x)
        if GetPlayerZone(x) == 1 and tokill == True and role != 0 then
            print(x)
            dmg(x)
        end
    end
    CreateTimer("StartSuffering",5000,0)
end

def Decom()
    ServerMessage("[FACILITY] LCZ Decontamination Process has started.")
    StartSuffering()
end

public def OnPlayerClickButton()
    StartSuffering()
end

public def OnPlayerChat()
    CreateTimer("DecomTimer",1, 0, 15)
end


public def OnScriptLoaded()
    print("LCZ Decontamination Feature Mod by Xandromeda#3756 and Goodman#4723 loaded!")
end


public def OnServerRestart()
    tokill = False
end

//public def OnPlayerChat(playerid, text)
    //if instr(text, "/inj", 1)
        //zone = GetPlayerZone(playerid)
        //CreateTimer("d1", 3000, 0)
        //SendMessage(playerid, "Current Zone: " + zone)
        //return 0
	//end
//end
