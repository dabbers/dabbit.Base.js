using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;

namespace dabbit.Base
{
    public class User
    {
        public User()
        {
            this.modes = new List<string>();
            this.channels = new List<Channel>();
            this.attributes = new List<string>();
        }

        public User(SourceEntity se)
            :base()
        {
            if (se.Type != SourceEntityType.Client)
            {
                this.Nick = se.Parts[0];
                this.Host = se.Parts[0];
                this.Ident = "";
                this.Name = "";
            }
            else
            {
                this.Nick = se.Parts[0];
                this.Ident = se.Parts[1];
                this.Host = se.Parts[2];
                this.Name = "";
            }
        }

        public virtual string Nick { get; set; }
        public virtual string Ident { get; set; }

        public virtual string Host 
        { 
            get { return host; }
            set { host = value; } 
        }
        
        private string host = String.Empty;

        public string IdentifiedAs { get; set; }

        public virtual List<string> Modes
        {
            get
            {
                return this.modes;
            }
            set
            {
                this.modes = value;
            }
        }

        public List<Channel> Channels
        {
            get
            {
                return this.channels;
            }
            set
            {
                this.channels = value;
            }
        }

        public string Name { get; set; }
        public string Display { get { return (this.Modes.Count() != 0 ? this.Modes[0] : "") + this.Nick; } }
        public bool IrcOp { get; set; }
        public bool Identified { get; set; }
        public string Server { get; set; }
        public int IdleTime { get; set; }

        public DateTime SignedOn { get; set; }
        public virtual List<string> Attributes 
        {
            get
            {
                return this.attributes;
            }
            set
            {
                this.attributes = value;
            }
        }

        private List<string> attributes = new List<string>();
        private List<string> modes = new List<string>();
        private List<Channel> channels = new List<Channel>();
    }
}
