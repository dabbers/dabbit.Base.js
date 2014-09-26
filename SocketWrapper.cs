using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace dabbit.Base
{
    public interface ISocketWrapper
    {
        // Request these attributes in the Constructor
        string Host { get; }
        int Port { get; }
        bool Secure { get; }


        bool Connected { get; }

        Task ConnectAsync();

        void Disconnect();

        StreamReader Reader { get; }

        StreamWriter Writer { get; }
    }
}
