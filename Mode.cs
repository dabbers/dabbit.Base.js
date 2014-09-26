using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;


namespace dabbit.Base
{
    public class Mode
    {
        public char Character { get; internal set; }

        public char Display { get; internal set; }

        public string Argument { get; internal set; }

        public ModeType Type { get; internal set; }

        public ModeModificationType ModificationType { get; internal set; }
    }

    public enum ModeType
    {
		User,
		Channel,
		UMode
    }

    public enum ModeModificationType
    {
        Adding,
        Removing
    }
}
