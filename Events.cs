using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;

namespace dabbit.Base
{
    public delegate void IrcEventHandler(object sender, Message e);
    public delegate void PrivmsgEventHandler(object sender, PrivmsgMessage e);
    public delegate void NoticeEventHandler(object sender, PrivmsgMessage e);
    public delegate void ActionEventHandler(object sender, PrivmsgMessage e);
    public delegate void ModeChangeEventHandler(object sender, ModeMessage e);
    public delegate void CtcpEventHandler(object sender, Message e);
    public delegate void ErrorEventHandler(object sender, Message e);
    public delegate void PingEventHandler(object sender, Message e);
    public delegate void KickEventHandler(object sender, Message e);
    public delegate void JoinEventHandler(object sender, JoinMessage e);
    public delegate void NamesEventHandler(object sender, Message e);
    public delegate void ListEventHandler(object sender, ListMessage e);
    public delegate void PartEventHandler(object sender, Message e);
    public delegate void InviteEventHandler(object sender, Message e);
    public delegate void OpEventHandler(object sender, Message e);
    public delegate void DeopEventHandler(object sender, Message e);
    public delegate void AdminEventHandler(object sender, Message e);
    public delegate void DeadminEventHandler(object sender, Message e);
    public delegate void IrcopEventHandler(object sender, Message e);
    public delegate void DeircopEventHandler(object sender, Message e);
    public delegate void HalfopEventHandler(object sender, Message e);
    public delegate void DehalfopEventHandler(object sender, Message e);
    public delegate void OwnerEventHandler(object sender, Message e);
    public delegate void DeownerEventHandler(object sender, Message e);
    public delegate void VoiceEventHandler(object sender, Message e);
    public delegate void DevoiceEventHandler(object sender, Message e);
    public delegate void BanEventHandler(object sender, Message e);
    public delegate void UnbanEventHandler(object sender, Message e);
    public delegate void TopicEventHandler(object sender, Message e);
    public delegate void NickChangeEventHandler(object sender, NickChangeMessage e);
    public delegate void QuitEventHandler(object sender, QuitMessage e);
    public delegate void AwayEventHandler(object sender, Message e);
    public delegate void WhoIsEventHandler(object sender, WhoisMessage e);
    public delegate void MotdEventHandler(object sender, Message e);
    public delegate void PongEventHandler(object sender, Message e);
}
