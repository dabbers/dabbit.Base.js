using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace dabbit.Base
{
    // reply ids
    public enum RawReplies
    {
        RplNone = 0,
        // Initial
        RplWelcome_001 = 001,                  // :Welcome to the Internet Relay Network <nickname>
        RplYourHost_002 = 002,                  // :Your host is <server>, running version <ver>
        RplCreated_003 = 003,                  // :This server was created <datetime>
        RplMyInfo_004 = 004,                  // <server> <ver> <usermode> <chanmode>
        RplMap_005 = 005,                  // :map
        RplEndOfMap_007 = 007,                  // :End of /MAP
        RplMotdStart_375 = 375,                  // :- server Message of the Day
        RplMotd_372 = 372,                  // :- <info>
        RplMotdAlt_377 = 377,                  // :- <info>                                                                        (some)
        RplMotdAlt2_378 = 378,                  // :- <info>                                                                        (some)
        RplMotdEnd_376 = 376,                  // :End of /MOTD command.
        RplUModeIs_221 = 221,                  // <mode>

        // IsOn/UserHost
        RplUserHost_302 = 302,                  // :userhosts
        RplIsOn_303 = 303,                  // :nicknames

        // Away
        RplAway_301 = 301,                  // <nick> :away
        RplUnAway_305 = 305,                  // :You are no longer marked as being away
        RplNowAway_306 = 306,                  // :You have been marked as being away

        // WHOIS/WHOWAS
        RplWhoisHelper_310 = 310,                  // <nick> :looks very helpful                                                       DALNET
        RplWhoIsUser_311 = 311,                  // <nick> <username> <address> * :<info>
        RplWhoIsServer_312 = 312,                  // <nick> <server> :<info>
        RplWhoIsOperator_313 = 313,                  // <nick> :is an IRC Operator
        RplWhoIsIdle_317 = 317,                  // <nick> <seconds> <signon> :<info>
        RplEndOfWhois_318 = 318,                  // <request> :End of /WHOIS list.
        RplWhoIsChannels_319 = 319,                  // <nick> :<channels>
        RplWhoWasUser_314 = 314,                  // <nick> <username> <address> * :<info>
        RplEndOfWhoWas_369 = 369,                  // <request> :End of WHOWAS
        RplWhoReply_352 = 352,                  // <channel> <username> <address> <server> <nick> <flags> :<hops> <info>
        RplEndOfWho_315 = 315,                  // <request> :End of /WHO list.
        RplUserIPs_307 = 307,                  // :userips                                                                         UNDERNET
        RplUserIP_340 = 340,                  // <nick> :<nickname>=+<user>@<IP.address>                                          UNDERNET

        // List
        RplListStart_321 = 321,                  // Channel :Users Name
        RplList_322 = 322,                  // <channel> <users> :<topic>
        RplListEnd_323 = 323,                  // :End of /LIST
        RplLinks_364 = 364,                  // <server> <hub> :<hops> <info>
        RplEndOfLinks_365 = 365,                  // <mask> :End of /LINKS list.

        // Post-Channel Join
        RplUniqOpIs_325 = 325,
        RplChannelModeIs_324 = 324,                  // <channel> <mode>
        RplChannelUrl_328 = 328,                  // <channel> :url                                                                   DALNET
        RplChannelCreated = 329,                  // <channel> <time>
        RplNoTopic_331 = 331,                  // <channel> :No topic is set.
        RplTopic_332 = 332,                  // <channel> :<topic>
        RplTopicSetBy_333 = 333,                  // <channel> <nickname> <time>
        RplNamReply_353 = 353,                  // = <channel> :<names>
        RplEndOfNames_366 = 366,                  // <channel> :End of /NAMES list.

        // Invitational
        RplInviting_341 = 341,                  // <nick> <channel>
        RplSummoning_342 = 342,

        // Channel Lists
        RplInviteList_346 = 346,                  // <channel> <invite> <nick> <time>                                                 IRCNET
        RplEndOfInviteList_357 = 357,                  // <channel> :End of Channel Invite List                                            IRCNET
        RplExceptList_348 = 348,                  // <channel> <exception> <nick> <time>                                              IRCNET
        RplEndOfExceptList_349 = 349,                  // <channel> :End of Channel Exception List                                         IRCNET
        RplBanList_367 = 367,                  // <channel> <ban> <nick> <time>
        RplEndOfBanList_368 = 368,                  // <channel> :End of Channel Ban List


        // server/misc
        RplVersion_351 = 351,                  // <version>.<debug> <server> :<info>
        RplInfo_371 = 371,                  // :<info>
        RplEndOfInfo_374 = 374,                  // :End of /INFO list.
        RplYoureOper_381 = 381,                  // :You are now an IRC Operator
        RplRehashing_382 = 382,                  // <file> :Rehashing
        RplYoureService_383 = 383,
        RplTime_391 = 391,                  // <server> :<time>
        RplUsersStart_392 = 392,
        RplUsers_393 = 393,
        RplEndOfUsers_394 = 394,
        RplNoUsers_395 = 395,
        RplServList_234 = 234,
        RplServListEnd_235 = 235,
        RplAdminMe_256 = 256,                  // :Administrative info about server
        RplAdminLoc1_256 = 257,                  // :<info>
        RplAdminLoc2_258 = 258,                  // :<info>
        RplAdminEMail_259 = 259,                  // :<info>
        RplTryAgain_263 = 263,                  // :Server load is temporarily too heavy. Please wait a while and try again.

        // tracing
        RplTraceLink_200 = 200,
        RplTraceConnecting_201 = 201,
        RplTraceHandshake_202 = 202,
        RplTraceUnknown_203 = 203,
        RplTraceOperator_204 = 204,
        RplTraceUser_205 = 205,
        RplTraceServer_206 = 206,
        RplTraceService_207 = 207,
        RplTraceNewType_208 = 208,
        RplTraceClass_209 = 209,
        RplTraceReconnect_210 = 210,
        RplTraceLog_261 = 261,
        RplTraceEnd_262 = 262,

        // stats
        RplStatsLinkInfo_211 = 211,                  // <connection> <sendq> <sentmsg> <sentbyte> <recdmsg> <recdbyte> :<open>
        RplStatsCommands_212 = 212,                  // <command> <uses> <bytes>
        RplStatsCLine_213 = 213,                  // C <address> * <server> <port> <class>
        RplStatsNLine_214 = 214,                  // N <address> * <server> <port> <class>
        RplStatsILine_215= 215,                  // I <ipmask> * <hostmask> <port> <class>
        RplStatsKLine_216 = 216,                  // k <address> * <username> <details>
        RplStatsPLine_217 = 217,                  // P <port> <??> <??>
        RplStatsQLine_222 = 222,                  // <mask> :<comment>
        RplStatsELine_223 = 223,                  // E <hostmask> * <username> <??> <??>
        RplStatsDLine_224 = 224,                  // D <ipmask> * <username> <??> <??>
        RplStatsLLine_241 = 241,                  // L <address> * <server> <??> <??>
        RplStatsuLine_242 = 242,                  // :Server Up <num> days, <time>
        RplStatsoLine_243 = 243,                  // o <mask> <password> <user> <??> <class>
        RplStatsHLine_244 = 244,                  // H <address> * <server> <??> <??>
        RplStatsGLine_247 = 247,                  // G <address> <timestamp> :<reason>
        RplStatsULine_248 = 248,                  // U <host> * <??> <??> <??>
        RplStatsZLine_249 = 249,                  // :info
        RplStatsYLine_218 = 218,                  // Y <class> <ping> <freq> <maxconnect> <sendq>
        RplEndOfStats_219 = 219,                  // <char> :End of /STATS report
        RplStatsUptime_242 = 242,

        // GLINE
        RplGLineList_280 = 280,                  // <address> <timestamp> <reason>                                                   UNDERNET
        RplEndOfGLineList_281 = 281,                  // :End of G-line List                                                              UNDERNET

        // Silence
        RplSilenceList_271 = 271,                  // <nick> <mask>                                                                    UNDERNET/DALNET
        RplEndOfSilenceList_272 = 272,                  // <nick> :End of Silence List                                                      UNDERNET/DALNET

        // LUser
        RplLUserClient251 = 251,                  // :There are <user> users and <invis> invisible on <serv> servers
        RplLUserOp_252 = 252,                  // <num> :operator(s) online
        RplLUserUnknown_253 = 253,                  // <num> :unknown connection(s)
        RplLUserChannels_254 = 254,                  // <num> :channels formed
        RplLUserMe_255 = 255,                  // :I have <user> clients and <serv> servers
        RplLUserLocalUser_265 = 265,                  // :Current local users: <curr> Max: <max>
        RplLUserGlobalUser_266 = 266,                  // :Current global users: <curr> Max: <max>


        // Errors
        ErrNoSuchNick_401 = 401,                  // <nickname> :No such nick
        ErrNoSuchServer_402 = 402,                  // <server> :No such server
        ErrNoSuchChannel_403 = 403,                  // <channel> :No such channel
        ErrCannotSendToChan_404 = 404,                  // <channel> :Cannot send to channel
        ErrTooManyChannels_405 = 405,                  // <channel> :You have joined too many channels
        ErrWasNoSuchNick_406 = 406,                  // <nickname> :There was no such nickname
        ErrTooManyTargets_407 = 407,                  // <target> :Duplicate recipients. No message delivered
        ErrNoColors_408 = 408,                  // <nickname> #<channel> :You cannot use colors on this channel. Not sent: <text>   DALNET
        ErrNoOrigin_409 = 409,                  // :No origin specified
        ErrNoRecipient_411 = 411,                  // :No recipient given (<command>)
        ErrNoTextToSend_412 = 412,                  // :No text to send
        ErrNoTopLevel_413 = 413,                  // <mask> :No toplevel domain specified
        ErrWildTopLevel_414 = 414,                  // <mask> :Wildcard in toplevel Domain
        ErrBadMask_415 = 415,
        ErrTooMuchInfo_416 = 416,                  // <command> :Too many lines in the output, restrict your query                     UNDERNET
        ErrUnknownCommand_421 = 421,                  // <command> :Unknown command
        ErrNoMotd_422 = 422,                  // :MOTD File is missing
        ErrNoAdminInfo_423 = 423,                  // <server> :No administrative info available
        ErrFileError_424 = 424,
        ErrNoNicknameGiven_431 = 431,                  // :No nickname given
        ErrErroneusNickname_432 = 432,                  // <nickname> :Erroneus Nickname
        ErrNickNameInUse_432 = 433,                  // <nickname> :Nickname is already in use.
        ErrNickCollision_436 = 436,                  // <nickname> :Nickname collision KILL
        ErrUnAvailResource_437 = 437,                  // <channel> :Cannot change nickname while banned on channel
        ErrNickTooFast_438 = 438,                  // <nick> :Nick change too fast. Please wait <sec> seconds.                         (most)
        ErrTargetTooFast_439 = 439,                  // <target> :Target change too fast. Please wait <sec> seconds.                     DALNET/UNDERNET
        ErrUserNotInChannel_441 = 441,                  // <nickname> <channel> :They aren't on that channel
        ErrNotOnChannel_442 = 442,                  // <channel> :You're not on that channel
        ErrUserOnChannel_443 = 443,                  // <nickname> <channel> :is already on channel
        ErrNoLogin_444 = 444,
        ErrSummonDisabled_445 = 445,                  // :SUMMON has been disabled
        ErrUsersDisabled_446 = 446,                  // :USERS has been disabled
        ErrNotRegistered_451 = 451,                  // <command> :Register first.
        ErrNeedMoreParams_461 = 461,                  // <command> :Not enough parameters
        ErrAlreadyRegistered_462 = 462,                  // :You may not reregister
        ErrNoPermForHost_463 = 463,
        ErrPasswdMistmatch_464 = 464,
        ErrYoureBannedCreep_465 = 465,
        ErrYouWillBeBanned_466 = 466,
        ErrKeySet_467 = 467,                  // <channel> :Channel key already set
        ErrServerCanChange_468 = 468,                  // <channel> :Only servers can change that mode                                     DALNET
        ErrChannelIsFull_472 = 471,                  // <channel> :Cannot join channel (+l)
        ErrUnknownMode_472 = 472,                  // <char> :is unknown mode char to me
        ErrInviteOnlyChan_473 = 473,                  // <channel> :Cannot join channel (+i)
        ErrBannedFromChan_474 = 474,                  // <channel> :Cannot join channel (+b)
        ErrBadChannelKey_475 = 475,                  // <channel> :Cannot join channel (+k)
        ErrBadChanMask_476 = 476,
        ErrNickNotRegistered_477 = 477,                  // <channel> :You need a registered nick to join that channel.                      DALNET
        ErrBanListFull_478 = 478,                  // <channel> <ban> :Channel ban/ignore list is full
        ErrNoPrivileges_481 = 481,                  // :Permission Denied- You're not an IRC operator
        ErrChanOPrivsNeeded_482 = 482,                  // <channel> :You're not channel operator
        ErrCantKillServer_483 = 483,                  // :You cant kill a server!
        ErrRestricted_484 = 484,                  // <nick> <channel> :Cannot kill, kick or deop channel service                      UNDERNET
        ErrUniqOPrivsNeeded_485 = 485,                  // <channel> :Cannot join channel (reason)
        ErrNoOperHost_491 = 491,                  // :No O-lines for your host
        ErrUModeUnknownFlag_501 = 501,                  // :Unknown MODE flag
        ErrUsersDontMatch_502 = 502,                  // :Cant change mode for other users
        ErrSilenceListFull_511 = 511                   // <mask> :Your silence list is full                                                UNDERNET/DALNET

    };  // eo enum Reply
}
