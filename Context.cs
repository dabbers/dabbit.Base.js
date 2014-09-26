using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace dabbit.Base
{
    public interface IContext
    {
        Connection CreateConnection(ConnectionType connectionType, ISocketWrapper socket);
        
        List<Server> Servers { get; set; }

        Dictionary<string, string> Settings { get; set; }
        
        /// <summary>
        /// Creates a blank TCP Socket for use in a connection
        /// </summary>
        /// <param name="host">The host you want to connect to.</param>
        /// <param name="port">port</param>
        /// <param name="secure">bool is secure</param>
        /// <returns>A socket wrapper for a connection. This is platform dependant. This will not be in the same namespace</returns>
        ISocketWrapper CreateSocket(string host, int port, bool secure);

        Channel CreateChannel(Server svr);

        User CreateUser(SourceEntity source);
        User CreateUser();
    }


}
