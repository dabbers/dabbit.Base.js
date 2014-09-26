using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;

namespace dabbit.Base
{
    public class Message
    {
        public string[] Parts { get; internal set; }
        public string MessageLine { get; set; }
        public string Command { get; internal set; }
        public string RawLine { get; internal set; }

        public SourceEntity From { get; internal set; }
        public DateTime Timestamp { get; internal set; }

    }
    public class SourceEntity
    {
        public SourceEntityType Type { get { return this.fromType; } }
        public string[] Parts { get { return this.parts; } }

        public SourceEntity(string[] parts, SourceEntityType sourceType)
        {
            this.fromType = sourceType;
            this.parts = parts;
        }

        private SourceEntityType fromType;
        private string[] parts;
    }
    public enum SourceEntityType
    {
        Server,
        Client,
        BNC,
        Dabbit,
        Channel
    }
}
